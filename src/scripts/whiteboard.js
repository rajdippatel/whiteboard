(function (scope) {

    var ALIAS_OFFSET = 0.5;

    var ShapeType = {
        FreeHand: 1,
        Arrow: 2,
        Rectangle: 3,
    };

    var Point = function (x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    }

    var Rect = function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    var Shape = function (type, color, points) {
        this.type = type;
        this.color = color,
        this.points = points || [];
    }

    var WB = function (canvas) {
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
        } 

        this.canvas = canvas || document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineWidth = "1";

        this.shapes = [];
        this.undoShapes = [];
        this.activeShape = null;
        this.events = {};
        this.clientRect = null;
        this.dirtyData = null;
        this.dirtyRect = null;

        this.currentShapeType = ShapeType.Rectangle;
        this.currentColor = "#000000";

        this.init();        
    }

    var proto = WB.prototype;

    proto.getElement = function () {
        return this.canvas;
    }

    proto.getContext = function () {
        return this.ctx;
    }

    proto.init = function () {
        this.initSize();
        this.attachEvents();
    }

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

            ctx.scale(devicePixelRatio, devicePixelRatio);
        }
    }

    proto.setShapeType = function (shapeType) {
        this.currentShapeType = shapeType;
    }

    proto.setColor = function (color) {
        this.currentColor = color;
    }

    proto.attachEvents = function () {
        this.registerEvent(this.canvas, "mousedown", this.onMouseDown);
    }

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

    proto.onMouseDown = function (e) {
        if (this.currentShapeType) {
            this.registerEvent(document, "mousemove", this.onMouseMove);
            this.registerEvent(document, "mouseup", this.onMouseUp);
            this.clientRect = this.canvas.getBoundingClientRect();
            this.shapes.push(this.activeShape = new Shape(this.currentShapeType, this.currentColor, [this.getOffsetPoint(e), this.getOffsetPoint(e)]));            
        }
    }

    proto.onMouseMove = function (e) {
        this.processEvent(e, this.backupPixelRect.bind(this));
    }

    proto.onMouseUp = function (e) {
        this.processEvent(e);
        this.unRegisterEvent(document, "mousemove");
        this.unRegisterEvent(document, "mouseup");
        console.log(this.shapes);
        this.activeShape = null;
    }

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
            this.eraseDirtyRect();
            this.drawShape(this.activeShape, pixelBackupHandler);
        }        
    }

    proto.drawShapes = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.shapes.length; i++) {
            this.drawShape(this.shapes[i]);
        }
    }

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

    proto.backupPixelRect = function (rect) {
        this.dirtyRect = rect;
        this.dirtyData = this.ctx.getImageData(this.dirtyRect.x, this.dirtyRect.y, this.dirtyRect.width, this.dirtyRect.height);
    }

    proto.eraseDirtyRect = function () {
        if (this.dirtyData && this.dirtyRect) {
            this.ctx.putImageData(this.dirtyData, this.dirtyRect.x, this.dirtyRect.y);
            this.dirtyData = this.dirtyRect = null;
        }
    }

    proto.getOffsetPoint = function (e) {
        return new Point(e.clientX - this.clientRect.left, e.clientY - this.clientRect.top);
    }

    proto.undo = function () {
        if (this.shapes.length > 0) {
            this.undoShapes.push(this.shapes.pop());
            console.log(this.shapes);
            this.drawShapes();
        }
    }

    proto.redo = function () {
        if (this.undoShapes.length > 0) {
            this.shapes.push(this.undoShapes.pop());
            console.log(this.shapes);
            this.drawShapes();
        }
    }

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

    WB.ShapeType = ShapeType;
    scope.WhiteBoard = WB;
})(window);