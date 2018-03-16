/*
Author : Rajdip Patel (raj.rajdip89@gmail.com)

Whiteboard public api test file.

*/


var whiteboard;
/* Register page onload event to initialize whiteboard object globally */
window.onload = function () {
    whiteboard = new WhiteBoard("whiteboard");    
}

/* Sets Rangle shape type on global whiteboard object */
function onRectableButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.Rectangle);
}

/* Sets FreeHand shape type on global whiteboard object */
function onFreeHandButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.FreeHand);
}

/* Sets Arrway shape type on global whiteboard object */
function onArrowButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.Arrow);    
}

/* Performs undo operation on global whiteboard object */
function onUndoButtonClick() {
    whiteboard.undo();
}

/* Performs redo operation on global whiteboard object */
function onRedoButtonClick() {
    whiteboard.redo();
}

/* Clears global whiteboard object, so all previously drawn area will be erased */
function onClearButtonClick() {
    whiteboard.clear();
}

/* Changes color for next drawing on global whiteboard object */

function onColorButtonClick(color) {
    whiteboard.setColor(color);
}

