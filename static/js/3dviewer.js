
const TILESETS = [
    {name: '3d-TILER: House', url: 'static/tile/tiler/house/tileset.json'},
    {name: '3d-TILER: Mountain', url: 'static/tile/tiler/mountain/tileset.json'},
    {name: '3d-TILER: Mountain level0', url: 'static/tile/tiler/mountain_level0/tileset.json'},
    {name: '3d-TILER: Chocolate Farm', url: 'static/tile/tiler/choco/tileset.json'},
    {name: '3d-TILER: Mountain (From glTF)', url: 'static/tile/tiler/mountain_gltf/tileset.json'},
    {name: '3d-TILER: Chocolate Farm (From glTF)', url: 'static/tile/tiler/choco_gltf/tileset.json'},
    {name: '3d-TILER: City (From Collada)', url: 'static/tile/tiler/city_collada/tileset.json'},
    {name: '3d-TILER: My city(level0)', url: 'static/tile/tiler/my_city_level0/tileset.json'},
    {name: '3d-TILER: My city', url: 'static/tile/tiler/my_city/tileset.json'},
    {name: '3d-TILER: TEST', url: 'static/tile/tiler/test/tileset.json'},
];

const DEBUG = true;
const RX = 0, RY = 0, RZ = 0;
const TX = 0, TY = 0, TZ = 0; 

var tileset;
var viewer;

$(document).ready(function () {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjZlN2NjYS0zZjYwLTQ1NzktOWFiOS0zZDVkNWY4MTliMGYiLCJpZCI6MzMyLCJpYXQiOjE1MjUyMjE5MDV9.Z9xKbte6Y5q0wM58jh81ALeIkHfH_LVUoia3d-H2Oog';

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;
    
    // load3DTileset(DEBUG);
    TILESETS.forEach((t) => {
        $('select#model').append("<option value='"+ t.url +"' >"+ t.name +"</option>");
    });


    // see();
});

$('select#model').change(() => {
    let url = $('select#model').val();

    if (url == '') {
        return;
    }

    clearAllPrimitives();

    load3DTileset(url, DEBUG);

    see();
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

    tileset.tileFailed.addEventListener(function(error) {
        console.log('An error occurred loading tile: ' + error.url);
        console.log('Error: ' + error.message);
    });
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

function rotate(x = RX, y = RY, z = RZ) {
    let rotMat3 = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(z),
            Cesium.Math.toRadians(y),
            Cesium.Math.toRadians(x)
        )
    );
    let rotMat4 = Cesium.Matrix4.fromRotationTranslation(rotMat3);
    console.log(rotMat4);

    let origin = tileset._root.transform.clone();

    Cesium.Matrix4.multiply(origin, rotMat4, tileset._root.transform);
}

function translate(x = TX, y = TY, z = TZ) {

    let xRadian = Cesium.Math.toRadians(x);
    let yRadian = Cesium.Math.toRadians(y);

    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude + yRadian, cartographic.latitude + xRadian, z);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());

    let origin = tileset.modelMatrix.clone();

    Cesium.Matrix4.multiply(origin, Cesium.Matrix4.fromTranslation(translation), tileset.modelMatrix);
}

function opacity(o) {
    viewer.imageryLayers.get(0).alpha = o;
}

function clearAllPrimitives() {
    viewer.scene.primitives.removeAll();
    tileset = undefined;
}