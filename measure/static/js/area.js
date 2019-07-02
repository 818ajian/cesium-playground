const DEBUG = true;

// tileset path
var TILESET = 'static/tile/road/tile_0_0_0_tex/tileset.json';

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

        translate(0, 0, 100);
    });
    
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    handler.setInputAction((click) => {

        // get position of 2D window (X,Y)
        let windowPosition = click.position;

        if (windowPosition) {

            // using 2D window's position to get 3D world position
            let worldPosition = viewer.scene.pickPosition(windowPosition);

            selectedPositions.push(worldPosition);

            if (selectedPositions.length == 3) {

                selectedPositions.push(worldPosition);

                // draw triangle
                activeTriangle.polygon.hierarchy = selectedPositions;
                triangles.push(activeTriangle);

                activeTriangle = null;

                // calculate area
                let area = calculateTriangleArea(selectedPositions[0], selectedPositions[1], selectedPositions[2]);

                selectedArea += area;

                setCursorLabel(selectedArea);

                // reset selected positions for next point selection
                selectedPositions = [selectedPositions[0], worldPosition];
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((move) => {

        if (selectedPositions.length == 2) {

            let windowPosition = move.endPosition;

            if (windowPosition) {

                let worldPosition = viewer.scene.pickPosition(windowPosition);

                let movingPositions = selectedPositions.slice();
                movingPositions.push(worldPosition);

                if (!activeTriangle) {

                    activeTriangle = viewer.entities.add({
                        polygon: {
                            hierarchy: movingPositions,
                            material : Cesium.Color.YELLOW.withAlpha(0.5),
                            heightReference: Cesium.HeightReference.NONE
                        }
                    });

                } else {

                    activeTriangle.polygon.hierarchy = movingPositions;
                }

                // show total area label beside mouse cursor
                let area = calculateTriangleArea(movingPositions[0], movingPositions[1], movingPositions[2]);

                showCursorLabel(true);
                setCursorLabel(selectedArea + area);
            }
        }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction((click) => {

        let windowPosition = click.position;

        if (windowPosition) {

            // using 2D window's position to get 3D world position
            let worldPosition = viewer.scene.pickPosition(windowPosition);

            if (selectedPositions.length == 2) {

                selectedPositions.push(worldPosition);

                // draw triangle
                activeTriangle.polygon.hierarchy = selectedPositions;
                triangles.push(activeTriangle);

                // calculate area
                let area = calculateTriangleArea(selectedPositions[0], selectedPositions[1], selectedPositions[2]);

                selectedArea += area;

                // draw label
                viewer.entities.add({
                    position : selectedPositions[selectedPositions.length - 1],
                    label : {
                        text : getApproximatedValue(selectedArea),
                        font: '16px sans-serif',
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        showBackground: true
                    }
                });

                // reset selected positions for next point selection
                selectedPositions = [];
                showCursorLabel(false);
                selectedArea = 0;
                completedAreas.push(triangles);
                triangles = [];
                activeTriangle = null;
            }
        }

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
});

$(document).on('mousemove', function(e){
    $('#area-tag').css({
       left:  e.pageX + 10,
       top:   e.pageY + 10
    });
});

function load3DTileset(url, debug = false, callback) {
    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url,
        skipLevelOfDetail: false,
        maximumScreenSpaceError: 512,

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

function calculateTriangleArea(pointA, pointB, pointC) {

    // calculate area
    let vectorA = new Cesium.Cartesian3(
        pointB.x - pointA.x,
        pointB.y - pointA.y,
        pointB.z - pointA.z
    );

    let vectorB = new Cesium.Cartesian3(
        pointC.x - pointA.x,
        pointC.y - pointA.y,
        pointC.z - pointA.z
    );

    let vectorC = new Cesium.Cartesian3();
    Cesium.Cartesian3.cross(vectorA, vectorB, vectorC);

    let area = Math.sqrt(vectorC.x**2 + vectorC.y**2 + vectorC.z**2);

    return area;
}

function setCursorLabel(area) {

    $('#area-tag').text(getApproximatedValue(area));
}

function showCursorLabel(show) {

    if (show) {

        $('#area-tag').css('display', 'inline-block');
    
    } else {

        $('#area-tag').css('display', 'none');
    }
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

function getApproximatedValue(area) {

    if (area > 1e6) {

        return (Math.floor(area / 1e4)/100) + ' km2';
    
    } else {

        return (Math.floor(area * 100)/100) + ' m2';
    }
}