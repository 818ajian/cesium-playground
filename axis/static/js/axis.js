var viewer;

$(document).ready(function () {

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjZlN2NjYS0zZjYwLTQ1NzktOWFiOS0zZDVkNWY4MTliMGYiLCJpZCI6MzMyLCJpYXQiOjE1MjUyMjE5MDV9.Z9xKbte6Y5q0wM58jh81ALeIkHfH_LVUoia3d-H2Oog';
    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    

    let xAxis = viewer.entities.add({
        name : 'X axis',
        polyline : {
            positions : [new Cesium.Cartesian3(0.000001, 0, 0), new Cesium.Cartesian3(10000000, 0, 0)],
            width : 10,
            arcType : Cesium.ArcType.NONE,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(1.0, 0, 0, 0.2))
        }
    });

    let yAxis = viewer.entities.add({
        name : 'Y axis',
        polyline : {
            positions : [new Cesium.Cartesian3(0, 0.000001, 0), new Cesium.Cartesian3(0, 10000000, 0)],
            width : 10,
            arcType : Cesium.ArcType.NONE,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 1, 0, 0.2))
        }
    });

    let zAxis = viewer.entities.add({
        name : 'Z axis',
        polyline : {
            positions : [new Cesium.Cartesian3(0, 0, 0.000001), new Cesium.Cartesian3(0, 0, 10000000)],
            width : 10,
            arcType : Cesium.ArcType.NONE,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 0, 1, 0.2))
        }
    });

});