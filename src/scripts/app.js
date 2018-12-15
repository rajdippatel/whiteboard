/*
Author : Rajdip Patel (raj.rajdip89@gmail.com)

Whiteboard public api test file.

*/


var whiteboard;
/* Register page onload event to initialize whiteboard object globally */
window.onload = function () {
    whiteboard = new WhiteBoard("whiteboard"); 
    whiteboard.addEventListener("shapeCompleted", onShapeCompleted);   
    whiteboard.restore(getShapesJson());
}

function getShapesJson() {
    return '[{"name":"A","type":3,"color":"#000000","points":[{"x":115,"y":90},{"x":491,"y":283}]},{"name":"Java","type":3,"color":"#000000","points":[{"x":659,"y":80},{"x":844,"y":297}]},{"name":"Test","type":3,"color":"green","points":[{"x":215,"y":346},{"x":534,"y":424}]},{"name":"1","type":3,"color":"red","points":[{"x":246,"y":125},{"x":460,"y":232}]},{"name":null,"type":3,"color":"red","points":[{"x":930,"y":328},{"x":782,"y":424}]},{"name":"Over","type":3,"color":"blue","points":[{"x":542,"y":184},{"x":620,"y":252}]},{"name":"A","type":3,"color":"blue","points":[{"x":951,"y":105},{"x":792,"y":242}]},{"name":"VD","type":3,"color":"blue","points":[{"x":591,"y":341},{"x":712,"y":406}]},{"name":"Java","type":3,"color":"blue","points":[{"x":17,"y":221},{"x":163,"y":415}]},{"name":null,"type":1,"color":"blue","points":[{"x":47,"y":96},{"x":47,"y":96},{"x":46,"y":96},{"x":44,"y":94},{"x":40,"y":86},{"x":38,"y":77},{"x":37,"y":67},{"x":36,"y":57},{"x":36,"y":53},{"x":38,"y":48},{"x":40,"y":44},{"x":44,"y":39},{"x":53,"y":31},{"x":58,"y":29},{"x":60,"y":30},{"x":68,"y":36},{"x":76,"y":40},{"x":83,"y":43},{"x":85,"y":44},{"x":87,"y":41},{"x":88,"y":37},{"x":89,"y":33},{"x":89,"y":30},{"x":89,"y":29},{"x":91,"y":29},{"x":93,"y":32},{"x":109,"y":34},{"x":131,"y":35},{"x":148,"y":36},{"x":157,"y":36},{"x":165,"y":34},{"x":173,"y":30},{"x":183,"y":24},{"x":187,"y":23},{"x":192,"y":27},{"x":203,"y":34},{"x":221,"y":36},{"x":232,"y":35},{"x":236,"y":34},{"x":238,"y":32},{"x":239,"y":28},{"x":243,"y":24},{"x":246,"y":25},{"x":252,"y":31},{"x":256,"y":35},{"x":258,"y":37},{"x":262,"y":40},{"x":273,"y":46},{"x":281,"y":45},{"x":287,"y":42},{"x":290,"y":41},{"x":295,"y":41},{"x":306,"y":47},{"x":317,"y":52},{"x":323,"y":52},{"x":329,"y":47},{"x":338,"y":39},{"x":350,"y":34},{"x":363,"y":33},{"x":383,"y":35},{"x":403,"y":38},{"x":407,"y":38},{"x":410,"y":39},{"x":416,"y":37},{"x":424,"y":34},{"x":434,"y":34},{"x":441,"y":33},{"x":444,"y":33},{"x":444,"y":33}]},{"name":null,"type":1,"color":"green","points":[{"x":72,"y":339},{"x":72,"y":339},{"x":72,"y":338},{"x":72,"y":337},{"x":72,"y":334},{"x":74,"y":326},{"x":78,"y":319},{"x":80,"y":317},{"x":81,"y":318},{"x":85,"y":322},{"x":89,"y":326},{"x":90,"y":330},{"x":92,"y":343},{"x":90,"y":352},{"x":91,"y":360},{"x":96,"y":367},{"x":103,"y":369},{"x":111,"y":363},{"x":114,"y":356},{"x":114,"y":355},{"x":114,"y":354},{"x":116,"y":356},{"x":117,"y":358},{"x":117,"y":359},{"x":118,"y":359},{"x":122,"y":369},{"x":129,"y":378},{"x":133,"y":386},{"x":135,"y":393},{"x":141,"y":400},{"x":149,"y":409},{"x":155,"y":415},{"x":157,"y":417},{"x":160,"y":420},{"x":164,"y":424},{"x":172,"y":429},{"x":176,"y":429},{"x":189,"y":426},{"x":191,"y":425},{"x":192,"y":425},{"x":193,"y":425},{"x":196,"y":428},{"x":197,"y":430},{"x":198,"y":431},{"x":199,"y":432},{"x":202,"y":435},{"x":206,"y":437},{"x":210,"y":439},{"x":214,"y":439},{"x":222,"y":434},{"x":225,"y":430},{"x":229,"y":423},{"x":231,"y":419},{"x":233,"y":418},{"x":251,"y":419},{"x":284,"y":411},{"x":299,"y":409},{"x":305,"y":408},{"x":313,"y":407},{"x":321,"y":413},{"x":331,"y":420},{"x":351,"y":421},{"x":370,"y":417},{"x":390,"y":418},{"x":401,"y":423},{"x":405,"y":424},{"x":409,"y":426},{"x":424,"y":430},{"x":433,"y":429},{"x":454,"y":424},{"x":476,"y":422},{"x":499,"y":422},{"x":520,"y":424},{"x":538,"y":425},{"x":553,"y":426},{"x":562,"y":427},{"x":570,"y":430},{"x":585,"y":434},{"x":597,"y":434},{"x":604,"y":433},{"x":610,"y":429},{"x":618,"y":426},{"x":626,"y":425},{"x":634,"y":424},{"x":641,"y":424},{"x":647,"y":425},{"x":655,"y":426},{"x":663,"y":426},{"x":668,"y":426},{"x":673,"y":427},{"x":675,"y":427},{"x":684,"y":427},{"x":692,"y":426},{"x":697,"y":424},{"x":701,"y":423},{"x":706,"y":419},{"x":713,"y":413},{"x":720,"y":405},{"x":728,"y":399},{"x":730,"y":394},{"x":730,"y":391},{"x":731,"y":380},{"x":731,"y":376},{"x":729,"y":364},{"x":730,"y":361},{"x":738,"y":351},{"x":744,"y":346},{"x":754,"y":344},{"x":758,"y":344},{"x":770,"y":345},{"x":777,"y":351},{"x":779,"y":353},{"x":783,"y":357},{"x":788,"y":362},{"x":790,"y":365},{"x":789,"y":364},{"x":788,"y":361},{"x":787,"y":359},{"x":786,"y":359},{"x":786,"y":358},{"x":785,"y":357},{"x":785,"y":356},{"x":785,"y":354},{"x":786,"y":354},{"x":786,"y":353},{"x":787,"y":353},{"x":790,"y":356},{"x":790,"y":356}]},{"name":null,"type":2,"color":"green","points":[{"x":557,"y":53},{"x":613,"y":161}]},{"name":"A","type":2,"color":"black","points":[{"x":501,"y":64},{"x":348,"y":195}]},{"name":"J","type":2,"color":"blue","points":[{"x":876,"y":398},{"x":968,"y":278}]}]';
}

/* Sets Rangle shape type on global whiteboard object */
function onRectableButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.Rectangle);
}

/* Sets FreeHand shape type on global whiteboard object */
function onFreeHandButtonClick() {
    whiteboard.setShapeType(WhiteBoard.ShapeType.FreeHand);
}

/* Sets Arrow shape type on global whiteboard object */
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

/* Whiboard callback event handler to prompt shape name from end user */
function onShapeCompleted(shape) {
    if(shape.type == WhiteBoard.ShapeType.Rectangle || shape.type == WhiteBoard.ShapeType.Arrow) {
        var shapeName = prompt("Please enter shape name");
        if(shapeName != null && shapeName.length > 0) {
            whiteboard.setShapeName(shape, shapeName);
        }
    }
}

function onExportButtonClick(color) {
    console.log(whiteboard.save());
}


