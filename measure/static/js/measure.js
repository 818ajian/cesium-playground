const DEBUG = true;

// tileset path
var TILESET = 'static/tile/road/tile_0_0_0_tex/tileset.json';

// 3DTileset entity
var tileset;

// Cesium viewer
var viewer;

// Cesium event handler
var handler;

// position buffer, it will be cleared when a polyline is completed
var positions = [];

// Polyline entity which is drawed when the measurement is not completed
var activeLine = null;

// Polylines of completed measurement
var completedLines = [];

$(document).ready(function () {

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false,
        infoBox: false
    });
    
    load3DTileset(TILESET);

    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    handler.setInputAction((click) => {

        // get position of 2D window (X,Y)
        let windowPosition = click.position;

        if (windowPosition) {

            // using 2D window's position to get 3D world position
            let worldPosition = viewer.scene.pickPosition(windowPosition);

            positions.push(worldPosition);

            // create billboard
            viewer.entities.add({
                position: worldPosition,
                billboard: {
                    image : 'static/image/pin_red.png',
                    pixelOffset : new Cesium.Cartesian2(0, -16),
                    scale : 1.0,
                    width : 24,
                    height : 32,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });

            // if there're more than two selected positions, show distance label on each line segment
            if (positions.length >= 2) {

                let currentPosition = positions[positions.length - 1];
                let previousPosition = positions[positions.length - 2];

                let distance = calculateDistance([currentPosition, previousPosition]);

                // draw distance label on center of line segment
                let center = new Cesium.Cartesian3(
                    (currentPosition.x + previousPosition.x)/2,
                    (currentPosition.y + previousPosition.y)/2,
                    (currentPosition.z + previousPosition.z)/2
                );

                viewer.entities.add({
                    position : center,
                    label : {
                        text : Math.floor(distance * 100) / 100 + ' m',
                        font: '16px sans-serif',
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
                });
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((move) => {

        if (positions.length >= 1) {

            let windowPosition = move.endPosition;

            if (windowPosition) {

                let worldPosition = viewer.scene.pickPosition(windowPosition);

                let movingPositions = positions.slice();
                movingPositions.push(worldPosition);

                if (activeLine == null) {

                    activeLine = viewer.entities.add({
                        polyline : {
                            positions : movingPositions,
                            width : 2,
                            material : new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.WHITE
                            }),
                            depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.RED
                            })
                        }
                    });

                } else {

                    activeLine.polyline.positions = movingPositions;
                }

                // show total distance label beside mouse cursor
                let distance = calculateDistance(movingPositions);
                $('#distance-tag').css('display', 'inline-block').text(Math.floor(distance * 100) / 100 + ' m');
            }
        }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction((click) => {

        if (positions.length >= 1) {

            $('#distance-tag').css('display', 'none');

            // get position of 2D window (X,Y)
            let windowPosition = click.position;

            if (windowPosition) {

                // using 2D window's position to get 3D world position
                let worldPosition = viewer.scene.pickPosition(windowPosition);

                positions.push(worldPosition);

                viewer.entities.add({
                    position: worldPosition,
                    billboard: {
                        image : 'static/image/pin_red.png',
                        pixelOffset : new Cesium.Cartesian2(0, -16),
                        scale : 1.0,
                        width : 24,
                        height : 32,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                });
        
                let distance = calculateDistance(positions);;
        
                // draw total distance label
                viewer.entities.add({
                    position : positions[positions.length - 1],
                    label : {
                        text : Math.floor(distance * 100) / 100 + ' m',
                        font: '16px sans-serif',
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
                });
        
                completedLines.push(activeLine);

                // reset
                activeLine = null;
                positions = [];
            }
        }

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
});

$(document).on('mousemove', function(e){
    $('#distance-tag').css({
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