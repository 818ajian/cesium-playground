const DEBUG = true;

var TILESET = 'static/tile/road/tile_0_0_0_tex/tileset.json';
var tileset;
var viewer;
var handler;

var startEntity = null;
var startPosition = null;
var endEntity = null;
var endPosition = null;

$(document).ready(function () {

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });
    
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;

    load3DTileset(TILESET);

    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    handler.setInputAction((click) => {

        let windowPosition = click.position;

        // console.log('window position', windowPosition);

        if (windowPosition) {

            let worldPosition = viewer.scene.pickPosition(windowPosition);

            // console.log('world position', worldPosition);

            if (startEntity == null && endEntity == null) {

                startEntity = viewer.entities.add({
                    position: worldPosition,
                    ellipsoid : {
                        radii : new Cesium.Cartesian3(0.5, 0.5, 0.5),
                        material : Cesium.Color.RED.withAlpha(0.8)
                    }
                });

                startPosition = worldPosition;
            
            } else if (startEntity != null && endEntity == null) {

                endEntity = viewer.entities.add({
                    position: worldPosition,
                    ellipsoid : {
                        radii : new Cesium.Cartesian3(0.5, 0.5, 0.5),
                        material : Cesium.Color.BLUE.withAlpha(0.8)
                    }
                });

                endPosition = worldPosition;

                console.log('distance', Cesium.Cartesian3.distance(startPosition, endPosition));

            } else if (startEntity != null && endEntity != null) {

                viewer.entities.remove(startEntity);
                viewer.entities.remove(endEntity);

                startEntity = viewer.entities.add({
                    position: worldPosition,
                    ellipsoid : {
                        radii : new Cesium.Cartesian3(0.5, 0.5, 0.5),
                        material : Cesium.Color.RED.withAlpha(0.8)
                    }
                });

                startPosition = worldPosition;

                endEntity = null;
                endPosition = null;
            }
            
        }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
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