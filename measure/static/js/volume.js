const DEBUG = true;

// tileset path
var TILESET = 'static/tile/cube/tileset.json';

// 3DTileset entity
var tileset;

// Cesium viewer
var viewer;

// Cesium event handler
var handler;

var selectedPositions = [];
var selectedPositionLabels = [];

var rectangle, rectangleGeometry;
var rectNorth, rectSouth, rectEast, rectWest;
var rectNorthCartesian, rectSouthCartesian, rectEastCartesian, rectWestCartesian;

var compute = false;

$(document).ready(function () {

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNjZlN2NjYS0zZjYwLTQ1NzktOWFiOS0zZDVkNWY4MTliMGYiLCJpZCI6MzMyLCJpYXQiOjE1MjUyMjE5MDV9.Z9xKbte6Y5q0wM58jh81ALeIkHfH_LVUoia3d-H2Oog';

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false,
        infoBox: false,
        terrainProvider: Cesium.createWorldTerrain({
            requestVertexNormals: true
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

    viewer.scene.globe.tileLoadProgressEvent.addEventListener((tileQueueLength) => {

        if ((tileQueueLength == 0) && compute) {

            compute = false;

            setTimeout(() => {

                let verticalCenter = viewer.scene.drawingBufferHeight / 2;
                let horizontalCenter = viewer.scene.drawingBufferWidth / 2;

                let cameraCenter = viewer.scene.pickPosition(new Cesium.Cartesian2(horizontalCenter, verticalCenter));
                let cameraCenterNeighbor = viewer.scene.pickPosition(new Cesium.Cartesian2(horizontalCenter + 1, verticalCenter));

                let perPixelDistance = Cesium.Cartesian3.distance(cameraCenter, cameraCenterNeighbor);
                console.log('per pixel distance: ' + perPixelDistance + 'm');

                let perPixelArea = perPixelDistance ** 2;

                let xStart = Math.round(viewer.scene.cartesianToCanvasCoordinates(westCartesian).x);
                let xEnd = Math.round(viewer.scene.cartesianToCanvasCoordinates(eastCartesian).x);
                let yStart = Math.round(viewer.scene.cartesianToCanvasCoordinates(northCartesian).y);
                let yEnd = Math.round(viewer.scene.cartesianToCanvasCoordinates(southCartesian).y);

                // start calculating volume

                let terrainVolume = 0;

                for (let x = xStart; x <= xEnd; x++) {

                    for (let y = yStart; y <= yEnd; y++) {

                        let cartesian3 = viewer.scene.pickPosition(new Cesium.Cartesian2(x, y));

                        let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);

                        terrainVolume += cartographic.height;

                    }
                }

                terrainVolume = terrainVolume * perPixelArea;

                console.log('terrain volume:' + terrainVolume + 'm^3');

                // turn on 3D model
                tileset.show = true;

                setTimeout(() => {

                    let allVolume = 0;

                    for (let x = xStart; x <= xEnd; x++) {

                        for (let y = yStart; y <= yEnd; y++) {

                            let cartesian3 = viewer.scene.pickPosition(new Cesium.Cartesian2(x, y));

                            let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);

                            allVolume += cartographic.height;
                        }
                    }

                    allVolume = allVolume * perPixelArea;

                    console.log('terrain volume + 3D model volume: ' + allVolume + 'm^3');

                    console.log('model volume: ' + (allVolume - terrainVolume) + 'm^3');
                }, 500);

            }, 500);
        }
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    load3DTileset(TILESET, false, () => {

        translate(0, 0, 20);
        rotate(90, 0, 0);
        scale(100);

        setTimeout(() => {

            // zoom to tileset
            see();

        }, 500);
    });

    // set mouse event handler
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    handler.setInputAction((leftClick) => {

        let windowPosition = leftClick.position;

        if (windowPosition) {

            // using 2D window's position to get 3D world position
            let worldPosition = viewer.scene.pickPosition(windowPosition);

            // clear old billboards
            viewer.entities._entities._array.forEach((ent) => {

                if (ent.billboard) {

                    viewer.entities.remove(ent);
                }
            });

            // create new billboard on current picked position
            viewer.entities.add({
                position: worldPosition,
                billboard: {
                    image: 'static/image/pin_red.png',
                    pixelOffset: new Cesium.Cartesian2(0, -12),
                    width: 8,
                    height: 12
                }
            });

            selectedPositions.push(worldPosition.clone());

            if (selectedPositions.length == 2) {

                // show 'compute' button
                showComputeButton();

                // draw a rectangle

                let rect = getMinimalRectangle();

                if (rectangleGeometry) {

                    viewer.entities.remove(rectangleGeometry)
                }

                rectangleGeometry = viewer.entities.add({
                    rectangle: {
                        coordinates: rect,
                        material: Cesium.Color.YELLOW.withAlpha(0.05),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                });

            } else if (selectedPositions.length > 2) {

                let rect = getMinimalRectangle();

                rectangleGeometry.rectangle.coordinates = rect;
            }
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
});

$('#compute').on('click', () => {

    let padding = 0.001; // in radians;

    let viewRectangle = new Cesium.Rectangle(west - padding, south - padding, east + padding, north + padding);

    // set camera to a top-down viewing angle
    viewer.camera.setView({ destination: viewRectangle });

    rectangleGeometry.show = false;
    // turn off 3D model
    tileset.show = false;

    increaseTilesetGeometricError();

    // switch on
    compute = true;
});

function load3DTileset(url, debug = false, callback) {
    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: url,
        skipLevelOfDetail: false,
        maximumScreenSpaceError: 16,

        debugColorizeTiles: debug,
        debugShowBoundingVolume: debug,
        // debugShowGeometricError: debug,
    }));

    tileset.readyPromise.then(() => {

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

    let offset = tileset.boundingSphere.radius;

    viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), offset * 4));
}

/**
 * calculate the distance of line segments
 * @param {Array} positions array of cartesian3
 */
function calculateDistance(positions) {

    let distance = 0;

    for (let i = 1; i < positions.length; i++) {

        distance += Cesium.Cartesian3.distance(positions[i], positions[i - 1]);
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

function showComputeButton(show = true) {

    if (show) {

        $('#compute').fadeIn();

    } else {

        $('#compute').fadeOut();
    }
}

function getMinimalRectangle() {

    // initialize
    north = Number.NEGATIVE_INFINITY;
    south = Number.POSITIVE_INFINITY;
    east = Number.NEGATIVE_INFINITY;
    west = Number.POSITIVE_INFINITY;

    for (let p of selectedPositions) {

        let cartographic = Cesium.Cartographic.fromCartesian(p);

        // update rectangle boundary
        if (cartographic.latitude > north) { north = cartographic.latitude; northCartesian = p; }
        if (cartographic.latitude < south) { south = cartographic.latitude; southCartesian = p; }
        if (cartographic.longitude > east) { east = cartographic.longitude; eastCartesian = p; }
        if (cartographic.longitude < west) { west = cartographic.longitude; westCartesian = p; }
    }

    let rectangle = new Cesium.Rectangle(west, south, east, north);

    return rectangle;
}

function increaseTilesetGeometricError() {

    tileset._geometricError = (tileset._geometricError + 1) * 3;

    let tripleError = (tile) => {

        tile.geometricError = (tile.geometricError + 1) * 3;

        if (tile.children && tile.children.length > 0) {

            tile.children.forEach(tripleError);
        }
    }

    tripleError(tileset._root);
}

function restoreTilesetGeometricError() {

    tileset._geometricError = (tileset._geometricError / 3) - 1;

    let restoreError = (tile) => {

        tile.geometricError = (tile.geometricError / 3) - 1;

        if (tile.children && tile.children.length > 0) {

            tile.children.forEach(restore);
        }
    }

    restore(tileset._root);
}