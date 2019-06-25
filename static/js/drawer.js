var viewer;
var cesiumDrawingTool;

$(document).ready(function () {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjZlN2NjYS0zZjYwLTQ1NzktOWFiOS0zZDVkNWY4MTliMGYiLCJpZCI6MzMyLCJpYXQiOjE1MjUyMjE5MDV9.Z9xKbte6Y5q0wM58jh81ALeIkHfH_LVUoia3d-H2Oog';

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;

    cesiumDrawingTool = new CesiumDrawingTool(viewer, 'cesiumContainer', '/cesiumapp/static/image/pin.png');

    cesiumDrawingTool.init();
});