/*
Author : Rajdip Patel (raj.rajdip89@gmail.com)

Whiteboard js library.

Supported Operations/Modes:

- Shape Types :
1) Rectangle
2) FeeHand
3) Arrow with triangle head

- Operation Types :
1) Color types
2) Undo/Redo support
3) Clear/Draw everything

Example Usage :

var whiteboard = new WhiteBoard("canvasId");
OR
var whiteboard = new WhiteBoard(canvasElement);
OR
var whiteboard = new WhiteBoard();

var canvasElement = whiteboard.getElement();

whiteboard.setColor('color');

whiteboard.setShapeType(WhiteBoard.ShapeType.Rectangle);
whiteboard.setShapeType(WhiteBoard.ShapeType.FreeHand);
whiteboard.setShapeType(WhiteBoard.ShapeType.Arrow); 

whiteboard.undo();
whiteboard.redo();

whiteboard.clear();

*/

/* Self-enclosed closure pattern to support custom scope names.
   Default scope will be global window object.
*/
(function (scope) {

    // Antialising offset to draw sharp lines/rectangles. 
    // Without this offset lines and rectangles will be blurry.       
    var ALIAS_OFFSET = 0.5;

    // Shape type enumuration
    var ShapeType = {
        FreeHand: 1,
        Arrow: 2,
        Rectangle: 3,
    };

    /* Point Class:-
        x: X-Axis coordinate
        y: Y-Axis coordinate
    */
    var Point = function (x, y) {
        this.x = x;
        this.y = y;
    }

    // Returns duplicated point object from existing values.
    // It will be useful to modify existing point object by keeping original object intact.
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    }

    /* Rectangle Class:-
        x: X-Axis coordinate
        y: Y-Axis coordinate
        width: Rectangle width
        height : Rectangle height
    */
    var Rect = function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /*
        Shape Class:-
        type: ShapeType
        color: String
        points: Array of points representing pixel co-ordinates
    */
    var Shape = function (type, color, points) {
        this.type = type;
        this.color = color,
        this.points = points || [];
    }

    /*
        WhiteBoard Class:-
        [canvas]: canvas id or canvas element

        Main whiteboard class to draw shapes, hanlding events. 
        If it is initilized with canvas id it will fetch canvas element from html dom.
        If it it initilized with canvas element it will try to utilize that canvas element.
        In other cases it will create its own canvas element to render shapes. It is caller's responsibilty to add canvas into dom at appropriate places.
    */
    var WhiteBoard = function (canvas) {
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
        } 

        // If canvas is not specified, create canvas element dynamically.
        this.canvas = canvas || document.createElement("canvas");
        // Store canvas context object, it will speedup performance while mouse/touch events
        this.ctx = this.canvas.getContext("2d");
        // Apply default drawing styles
        this.ctx.lineWidth = "1";

        // Shapes array to hold each and every shape which is drawn earlier on this whiteboard
        this.shapes = [];
        
        // Shapes array to keep undo done shapes
        this.undoShapes = [];
        
        // Holds reference to on-going shape, useful for interactive events
        this.activeShape = null;
        
        // Holds already registered events, useful for unbinding events once shape drawing finish
        this.events = {};
        
        // Canvas element's client bouding rect, useful for interactive events
        this.clientRect = null;

        // Whiteboard uses clipped redrawing way instead of re-drawing every shape on interactive events. Useful to achieve > 60fps frame rate on interactive events. 
        this.dirtyData = null;
        this.dirtyRect = null;

        // Stores current selected shape attribute selected by user.
        this.currentShapeType = ShapeType.Rectangle;
        this.currentColor = "#000000";

        this.init();        
    }

    // Shorthand to define prototype based methods.
    var proto = WhiteBoard.prototype;

    /*
        getElement Method:-
        Returns: canvas element
    */
    proto.getElement = function () {
        return this.canvas;
    }

    /*
        getContext Method:-
        Returns: Drawing context for canvas object
    */
    proto.getContext = function () {
        return this.ctx;
    }

    /*
        init Method:-
        Whiteboard initialization
    */
    proto.init = function () {
        this.initSize();
        this.attachEvents();
    }

    /*
        initSize Method:-
        Initialize canvas properties for HI-DPI (Retina) devices like MacBook, Mobiles Devices
    */
    proto.initSize = function() {
        if(devicePixelRatio != 1) {
            var canvas = this.canvas;
            var ctx = this.ctx;

            var width = canvas.width;
            var height = canvas.height;

            canvas.width = canvas.width * devicePixelRatio;
            canvas.height = canvas.height * devicePixelRatio;

            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            // Scale canvas context, so all drawing operation will be adjusted accordingly.
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }
    }

    proto.setShapeType = function (shapeType) {
        this.currentShapeType = shapeType;
    }

    proto.setColor = function (color) {
        this.currentColor = color;
    }

    /*
        attachEvents Method:-
        Registers only mousedown event on canvas element. 
        After mousedown event it will register mousemove, mouseup event on document elemenet. 
        So it will continue to receive mouse events even if cursor will go outside of canvas element, browser window etc.
    */
    proto.attachEvents = function () {
        this.registerEvent(this.canvas, "mousedown", this.onMouseDown);
    }

    /*
        clear Method:-
        Clears all shapes and resets it to original state
    */
    proto.clear = function () {
        this.shapes = this.undoShapes = [];
        this.drawShapes();
    }

    proto.registerEvent = function (element, eventType, eventHandler) {
        (addEventListener || attachEvent).call(element, eventType, this.events[eventType] = eventHandler.bind(this));
    }

    proto.unRegisterEvent = function (element, eventType) {
        (removeEventListener || detachEvent).call(element, eventType, this.events[eventType]);
        delete this.events[eventType];
    }

    /*
        onMouseDown Event Handler:-
        Handles mouse down event from canvas element. It creates new shape object and adds to shapes array.
    */
    proto.onMouseDown = function (e) {
        if (this.currentShapeType) {
            this.registerEvent(document, "mousemove", this.onMouseMove);
            this.registerEvent(document, "mouseup", this.onMouseUp);
            this.clientRect = this.canvas.getBoundingClientRect();
            this.shapes.push(this.activeShape = new Shape(this.currentShapeType, this.currentColor, [this.getOffsetPoint(e), this.getOffsetPoint(e)]));            
        }
    }

    /*
        onMouseMove Event Handler:-        
        Handles mouse move event from document element. Redraws current shape according to cursor position.
        e: Event object
    */
    proto.onMouseMove = function (e) {
        this.processEvent(e, this.backupPixelRect.bind(this));
    }

    /*
        onMouseUp Event Handler:-
        Handles mouse up event from document element. Redraws current shape according to cursor position. Finish drawing for current shape.
        e: Event object
    */
    proto.onMouseUp = function (e) {
        this.processEvent(e);
        this.unRegisterEvent(document, "mousemove");
        this.unRegisterEvent(document, "mouseup");
        console.log(this.shapes);
        this.activeShape = null;
    }

    /*
        processEvent Method:-
        Processes mousemove/up event handlers. 
        e: Event object
        [pixelBackupHandler]: If specified it will call that function to backup canvas surface before active shape will start
    */
    proto.processEvent = function (e, pixelBackupHandler) {
        if(this.activeShape != null) {
            switch (this.activeShape.type) {
                case ShapeType.Rectangle:
                case ShapeType.Arrow:
                    this.activeShape.points[1] = this.getOffsetPoint(e);
                    break;
                case ShapeType.FreeHand:
                    this.activeShape.points.push(this.getOffsetPoint(e));
                    break;
            }
            this.restoreDirtyRect();
            this.drawShape(this.activeShape, pixelBackupHandler);
        }        
    }

    /*
        drawShapes Method:-
        Redraws all shapes on canvas after clearing it.
    */
    proto.drawShapes = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.shapes.length; i++) {
            this.drawShape(this.shapes[i]);
        }
    }

    /*
        drawShape Method:-
        Draws single shape on canvas surface.
        shape: Shape to draw
        pixelBackupHandler: Callback function to backup canvas surface 
    */
    proto.drawShape = function (shape, pixelBackupHandler) {
        this.ctx.strokeStyle = this.ctx.fillStyle = shape.color;
        switch (shape.type) {
            case ShapeType.Rectangle:
                this.drawRectangle(shape, pixelBackupHandler);
                break;
            case ShapeType.Arrow:
                this.drawArrow(shape, pixelBackupHandler);
                break;
            case ShapeType.FreeHand:
                this.drawFreeHand(shape, pixelBackupHandler);
                break;
        }
    }

    /*
        drawArrow Method:-
        Draws array with triangle head.
        shape: Arrow shape to draw
        pixelBackupHandler: Callback function to backup canvas surface 
    */
    proto.drawArrow = function (shape, pixelBackupHandler) {
        var points = shape.points;        
        if (pixelBackupHandler) {
            var drawingRect = getMaxBoudingRect(points);
            pixelBackupHandler(new Rect(drawingRect.x * devicePixelRatio - 25, drawingRect.y * devicePixelRatio - 25, drawingRect.width * devicePixelRatio + 50, drawingRect.height * devicePixelRatio + 50));
        }

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x + ALIAS_OFFSET, points[0].y + ALIAS_OFFSET);
        this.ctx.lineTo(points[1].x + ALIAS_OFFSET, points[1].y + ALIAS_OFFSET);
        this.ctx.stroke();
        this.ctx.closePath();

        // Draw arrow head
        var radians = Math.atan((points[1].y - points[0].y) / (points[1].x - points[0].x));
        radians += ((points[1].x > points[0].x) ? 90 : -90) * Math.PI / 180;
        drawArrowhead(this.ctx, points[1].x, points[1].y, radians, shape.color);
    }

    /*
        drawRectangle Method:-
        Draws rectangle.
        shape: Rectangle shape to draw
        pixelBackupHandler: Callback function to backup canvas surface 
    */
    proto.drawRectangle = function (shape, pixelBackupHandler) {
        var points = shape.points;
        var drawingRect = getMaxBoudingRect(points);
        if (pixelBackupHandler) {
            pixelBackupHandler(new Rect(drawingRect.x * devicePixelRatio - 2, drawingRect.y * devicePixelRatio - 2, drawingRect.width * devicePixelRatio + 10, drawingRect.height * devicePixelRatio + 10));
        }
        this.ctx.beginPath();
        this.ctx.strokeRect(drawingRect.x + ALIAS_OFFSET, drawingRect.y + ALIAS_OFFSET, drawingRect.width, drawingRect.height);
        this.ctx.closePath();
    }

    /*
        drawFreeHand Method:-
        Draws freehand shape.
        shape: Freehand shape to draw        
    */
    proto.drawFreeHand = function (shape) {
        var points = shape.points;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (var i = 0; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();        
    }

    /*
        backupPixelRect Method:-
        Backups canvas surface pixel data before drawing temporary shape. Temporary shapes will be drawn only with mousemove events.
        rect: Area to backup
    */
    proto.backupPixelRect = function (rect) {
        this.dirtyRect = rect;
        this.dirtyData = this.ctx.getImageData(this.dirtyRect.x, this.dirtyRect.y, this.dirtyRect.width, this.dirtyRect.height);
    }

    /*
        restoreDirtyRect Method:-
        Restores previous canvas surface backup to clear dirty shape drawing
    */
    proto.restoreDirtyRect = function () {
        if (this.dirtyData && this.dirtyRect) {
            this.ctx.putImageData(this.dirtyData, this.dirtyRect.x, this.dirtyRect.y);
            this.dirtyData = this.dirtyRect = null;
        }
    }

    /*
        getOffsetPoint Method:-
        Converts mouse event co-oridinates to canvas element's offset. It is useful to convert offsets even when mouse event is generated from outside of canvas element or browser window.
        Returns: offset point on canvas element
    */
    proto.getOffsetPoint = function (e) {
        return new Point(e.clientX - this.clientRect.left, e.clientY - this.clientRect.top);
    }

    /*
        undo Method:-
        Performs undo operation by removing last drawn shape from surface
    */
    proto.undo = function () {
        if (this.shapes.length > 0) {
            this.undoShapes.push(this.shapes.pop());
            console.log(this.shapes);
            this.drawShapes();
        }
    }

    /*
        redo Method:
        Performs redo operation by adding last undo shape into surface
    */
    proto.redo = function () {
        if (this.undoShapes.length > 0) {
            this.shapes.push(this.undoShapes.pop());
            console.log(this.shapes);
            this.drawShapes();
        }
    }

    /*
        getMaxBoudingRect Method:-
        Utility method to get surrounding bound rectange for all given points.
        points: Array of points object
    */
    function getMaxBoudingRect(points) {
        var pointMin = points[0].clone();
        var pointMax = points[0].clone();
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            if (point.x < pointMin.x) {
                pointMin.x = point.x;
            }
            if (point.y < pointMin.y) {
                pointMin.y = point.y;
            }
            if (point.x > pointMax.x) {
                pointMax.x = point.x;
            }
            if (point.y > pointMax.y) {
                pointMax.y = point.y;
            }
        }
        return new Rect(pointMin.x, pointMin.y, pointMax.x - pointMin.x, pointMax.y - pointMin.y);
    }

    /*
        drawArrowhead Method:-
        Utility method to draw arrow head triangle.
        ctx: canvas context
        x: X-Axis co-ordinate
        y: Y-Axis co-ordinate
        radians: Slope of array head triangle
        color: Fill and Stroke color
    */
    function drawArrowhead(ctx, x, y, radians, color) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(radians);
        ctx.moveTo(0, 0);
        ctx.lineTo(5, 20);
        ctx.lineTo(-5, 20);
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }

    // Expose Shape utility on whiteboard namespace
    WhiteBoard.ShapeType = ShapeType;
    // Expose whiteboard on requested scope or on global window object
    (scope || window).WhiteBoard = WhiteBoard;
})();