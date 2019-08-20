const DEBUG = true;

// tileset path
var TILESET = 'static/tile/cube/tileset.json';

// 3DTileset entity
var tileset;

// Cesium viewer
var viewer;

// Cesium event handler
var handler;

// used to created triangles
var selectedPositions = [];
var selectedArea = 0;

var activeTriangle;

// triangles created in measurement
var triangles = []

// Polylines of completed measurement
var completedAreas = [];

$(document).ready(function () {

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjZlN2NjYS0zZjYwLTQ1NzktOWFiOS0zZDVkNWY4MTliMGYiLCJpZCI6MzMyLCJpYXQiOjE1MjUyMjE5MDV9.Z9xKbte6Y5q0wM58jh81ALeIkHfH_LVUoia3d-H2Oog';

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false,
        infoBox: false,
        terrainProvider : Cesium.createWorldTerrain({
            requestVertexNormals : true
        }),
        animation: false,
        timeline: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: true,
        baseLayerPicker: false,
        navigationHelpButton: false,
        scene3DOnly: false,
        fullscreenButton: false,
        vrButton: false,
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    load3DTileset(TILESET, false, () => {

        translate(0, 0, 20);

        rotate(90, 0, 0);
        scale(10);
    });
    
});

function load3DTileset(url, debug = false, callback) {
    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url,
        skipLevelOfDetail: false,
        maximumScreenSpaceError: 16,

        debugColorizeTiles: debug,
        debugShowBoundingVolume: debug,
        // debugShowGeometricError: debug,
    }));

    tileset.readyPromise.then(() => {

        see();

        if (typeof callback === 'function') {

            callback();
        }
    });
}

function debug(de = true) {
    tileset.debugColorizeTiles = de;
    tileset.debugShowBoundingVolume = de;
    //tileset.debugShowGeometricError = de;
}

function see() {
    viewer.zoomTo(tileset);
}

/**
 * calculate the distance of line segments
 * @param {Array} positions array of cartesian3
 */
function calculateDistance(positions) {

    let distance = 0;

    for (let i = 1; i < positions.length; i++) {

        distance += Cesium.Cartesian3.distance(positions[i], positions[i-1]);
    }

    return distance;
}

function translate(x, y, z) {

    let xRadian = Cesium.Math.toRadians(x);
    let yRadian = Cesium.Math.toRadians(y);

    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude + yRadian, cartographic.latitude + xRadian, z);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());

    let origin = tileset.modelMatrix.clone();

    Cesium.Matrix4.multiply(origin, Cesium.Matrix4.fromTranslation(translation), tileset.modelMatrix);
}

function rotate(x, y, z) {

    let rotMat3 = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(z),
            Cesium.Math.toRadians(y),
            Cesium.Math.toRadians(x)
        )
    );
    let rotMat4 = Cesium.Matrix4.fromRotationTranslation(rotMat3, undefined, undefined);

    let origin = tileset._root.transform.clone();

    Cesium.Matrix4.multiply(origin, rotMat4, tileset._root.transform);
}

function scale(s) {
    let m = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(s, s, s));

    let origin = tileset._root.transform.clone();

    Cesium.Matrix4.multiply(origin, m, tileset._root.transform);

}