const DEBUG = true;

// tileset path
var TILESET = 'static/tile/road/tile_0_0_0_tex/tileset.json';

// 3DTileset entity
var tileset;

// Cesium viewer
var viewer;

$(document).ready(function () {

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjZlN2NjYS0zZjYwLTQ1NzktOWFiOS0zZDVkNWY4MTliMGYiLCJpZCI6MzMyLCJpYXQiOjE1MjUyMjE5MDV9.Z9xKbte6Y5q0wM58jh81ALeIkHfH_LVUoia3d-H2Oog';

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false,
        infoBox: false
    });
    
    load3DTileset(TILESET, DEBUG);

    // start memory monitoring
    setTimeout(() => {
        
        setInterval(() => {
            $('#memory-usage').text(Math.floor((tileset.totalMemoryUsageInBytes/1e6) * 100) / 100);
        }, 500);

    }, 5000);

    $('#maximum-error').change(() => {

        tileset.maximumScreenSpaceError = parseInt($('#maximum-error').val());
    });

    $('#maximum-memory').change(() => {

        tileset.maximumMemoryUsage = parseInt($('#maximum-memory').val());
    });

    $('#debug').change(() => {

        let debug = $('#debug').prop('checked');

        tileset.debugColorizeTiles = debug;
        tileset.debugShowGeometricError = debug;
    });

    $(document).mousemove((event) => {

        $('#mouse-position').text(event.clientX + ', ' + event.clientY);
    });
});

function load3DTileset(url, debug = false) {
    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url,
        skipLevelOfDetail: false,
        maximumScreenSpaceError: 64,
        debugColorizeTiles: debug,
        // debugShowBoundingVolume: debug,
        debugShowGeometricError: debug,
    }));

    see();
}

function debug(de = true) {
    tileset.debugColorizeTiles = de;
    tileset.debugShowBoundingVolume = de;
    //tileset.debugShowGeometricError = de;
}

function see() {
    viewer.zoomTo(tileset);
}

function getTileSSE(tile) {
    return (tile.geometricError * viewer.scene.context.drawingBufferHeight) / (tile._distanceToCamera * viewer.camera.frustum.sseDenominator);
}