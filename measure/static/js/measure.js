const DEBUG = true;

// tileset path
var TILESET = 'static/tile/road/tile_0_0_0_tex/tileset.json';

// 3DTileset entity
var tileset;

// Cesium viewer
var viewer;

// Cesium event handler
var handler;

// Billboard entity at starting position of line
var startBillboard = null;
var startPosition = null;

// Polyline entity which is drawed during moving mouse
var movingLine = null;
var movingPosition = null;

// Polyline of completed measurement
var completedLines = [];

$(document).ready(function () {

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    
    load3DTileset(TILESET);

    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    handler.setInputAction((click) => {

        // get position of 2D window (X,Y)
        let windowPosition = click.position;

        if (windowPosition) {

            // using 2D window's position to get 3D world position
            let worldPosition = viewer.scene.pickPosition(windowPosition);

            // start position of a measurement line hasn't been picked
            if (startBillboard == null) {

                $("body").css("cursor", "crosshair");

                startBillboard = viewer.entities.add({
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

                startPosition = worldPosition;
            
            // start point has been picked, but end point hasn't been picked
            } else if (startBillboard != null) {

                $("body").css("cursor", "auto");

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

                startBillboard = null;

                completedLines.push(movingLine);
                movingLine = null;

                let distance = Cesium.Cartesian3.distance(startPosition, worldPosition)

                // draw distance label
                let center = new Cesium.Cartesian3(
                    (worldPosition.x + startPosition.x)/2,
                    (worldPosition.y + startPosition.y)/2,
                    (worldPosition.z + startPosition.z)/2
                );

                viewer.entities.add({
                    position : center,
                    label : {
                        text : Math.floor(distance * 100) / 100 + ' m',
                        font: '16px sans-serif',
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
                });

                $('#distance-tag').css('display', 'none');
            }
        }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction((move) => {

        if (startBillboard != null) {

            let windowPosition = move.endPosition;

            if (windowPosition) {

                let worldPosition = viewer.scene.pickPosition(windowPosition);

                movingPosition = worldPosition;

                if (movingLine == null) {

                    movingLine = viewer.entities.add({
                        polyline : {
                            positions : [startPosition, worldPosition],
                            width : 2,
                            material : new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.WHITE
                            }),
                            depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.RED.withAlpha(0.5)
                            })
                        }
                    });

                } else {
                    movingLine.polyline.positions = [startPosition, worldPosition];
                }

                let distance = Cesium.Cartesian3.distance(startPosition, worldPosition);
                $('#distance-tag').css('display', 'inline-block').text(Math.floor(distance*100) / 100 + ' m');
            }
        }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
        maximumScreenSpaceError: 128
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