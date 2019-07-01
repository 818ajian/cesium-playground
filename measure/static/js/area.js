const DEBUG = true;

// tileset path
var TILESET = 'static/tile/___';

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
        })
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
                        text : Math.floor((selectedArea / 1e6) * 100) / 100 + ' km2',
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

        // if (positions.length >= 1) {

        //     $('#distance-tag').css('display', 'none');

        //     // get position of 2D window (X,Y)
        //     let windowPosition = click.position;

        //     if (windowPosition) {

        //         // using 2D window's position to get 3D world position
        //         let worldPosition = viewer.scene.pickPosition(windowPosition);

        //         positions.push(worldPosition);

        //         // reset
        //         activeLine = null;
        //         positions = [];
        //     }
        // }

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
});

$(document).on('mousemove', function(e){
    $('#area-tag').css({
       left:  e.pageX + 10,
       top:   e.pageY + 10
    });
});

function load3DTileset(url, debug = false) {
    tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url,
        skipLevelOfDetail: false,
        dynamicScreenSpaceError: true,
        debugColorizeTiles: debug,
        debugShowBoundingVolume: debug,
        // debugShowGeometricError: debug,
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

    kmArea = area / 1e6;

    $('#area-tag').text(Math.floor(area * 100) / 100 + ' km2');
}

function showCursorLabel(show) {

    if (show) {

        $('#area-tag').css('display', 'inline-block');
    
    } else {

        $('#area-tag').css('display', 'none');
    }
}