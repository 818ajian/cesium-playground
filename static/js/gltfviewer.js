
var viewer;
var model;

$(document).ready(function () {

    viewer = new Cesium.Viewer('cesiumContainer', {
        shouldAnimate : true
    });

    model = viewer.entities.add({
        name : 'Model',
        position : Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0),
        model : {
            // uri : 'static/model/Cesium_Air.glb',
            uri : 'static/model/wind_turbine_old.gltf',
            minimumPixelSize : 128,
            maximumScale : 20000,
            // runAnimations: true,
            // clampAnimations: true
        }
    });
    
    viewer.trackedEntity = model;
});