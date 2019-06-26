var viewer;
var cesiumDrawingTool;

$(document).ready(function () {
    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;

    cesiumDrawingTool = new CesiumDrawingTool(viewer, 'cesiumContainer', 'static/image/pin.png');

    cesiumDrawingTool.init();
});