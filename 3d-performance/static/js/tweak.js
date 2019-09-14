const DEBUG = true;

const OPTIONS = {
    maximumScreenSpaceError: 64,
    maximumMemoryUsage: 128
};

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

    setTimeout(() => {
    
        // start memory monitoring
        setInterval(() => {
            $('#memory-usage').text(Math.floor((tileset.totalMemoryUsageInBytes/1e6) * 100) / 100);
        }, 500);

        // set up field value
        $('#maximum-error').val(tileset.maximumScreenSpaceError);
        $('#maximum-memory').val(tileset.maximumMemoryUsage);
        $('#debug').prop('checked', DEBUG);

    }, 3000);

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

    let canvas = document.querySelector('.cesium-widget > canvas');

    canvas.addEventListener('webglcontextlost', (event) => {

        console.log('loooooost');

        setCookie('model_maxsse', tileset.maximumScreenSpaceError * 2);
        setCookie('model_maxmem', tileset.maximumMemoryUsage / 2);
    });

});

function load3DTileset(url, debug = false) {

    // retrieve options from cookie

    let maxSSE = OPTIONS.maximumScreenSpaceError;
    let cookieMaxSSE = getCookie('model_maxsse');

    if (cookieMaxSSE && cookieMaxSSE >= maxSSE) {

        maxSSE = cookieMaxSSE;
    }

    let maxMem = OPTIONS.maximumMemoryUsage;
    let cookieMaxMem = getCookie('model_maxmem');

    if (cookieMaxMem && cookieMaxMem <= maxMem) {

        maxMem = cookieMaxMem;
    }

    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url,
        maximumScreenSpaceError: maxSSE,
        debugColorizeTiles: debug,
        debugShowGeometricError: debug,
        maximumMemoryUsage: maxMem
    }));

    see();
}

function see() {
    viewer.zoomTo(tileset);
}

function getTileSSE(tile) {
    return (tile.geometricError * viewer.scene.context.drawingBufferHeight) / (tile._distanceToCamera * viewer.camera.frustum.sseDenominator);
}