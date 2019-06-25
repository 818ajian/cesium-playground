const DEBUG = true;

var TILESET = 'static/tile/...../tileset.json';
var tileset;
var viewer;

$(document).ready(function () {

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;

    // load3DTileset(TILESET);
});

function load3DTileset(url, debug = false) {
    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url,
        skipLevelOfDetail: false,
        dynamicScreenSpaceError: true,
        debugColorizeTiles: debug,
        debugShowBoundingVolume: debug,
        // debugShowGeometricError: debug
    }));

    see();
}

function debug(de = true) {
    tileset.debugColorizeTiles = de;
    tileset.debugShowBoundingVolume = de;
    //tileset.debugShowGeometricError = de;
}

function closeImagery() {
    viewer.scene.imageryLayers.get(0).show = false;
}

function openImagery() {
    viewer.scene.imageryLayers.get(0).show = true;
}

function see() {
    viewer.zoomTo(tileset);
}