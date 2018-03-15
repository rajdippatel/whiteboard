var whiteboard;
window.onload = function () {
    whiteboard = new WhiteBoard("whiteboard");    
}

function onRectableButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.Rectangle);
}

function onFreeHandButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.FreeHand);
}

function onArrowButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.Arrow);    
}

function onUndoButtonClick() {
    whiteboard.undo();
}

function onRedoButtonClick() {
    whiteboard.redo();

}