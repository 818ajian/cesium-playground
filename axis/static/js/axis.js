var viewer;
let cesiumWorldTerrainProvider, ellipsoidTerrainProvider;
$(document).ready(function () {

    ellipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider();

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5M2NjNmVhMi0yODBkLTQxY2MtYWZhNC1kZjdjODE4MDk5ZmQiLCJpZCI6MzMyLCJzY29wZXMiOlsiYXNyIiwiZ2MiXSwiaWF0IjoxNTY2NDU3Njk2fQ.B8x7K0EDFe851UAkl-ZNoECepNPTZksTr4syp1alP8E';
    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false,
        terrainProvider: Cesium.createWorldTerrain()
    });

    cesiumWorldTerrainProvider = viewer.terrainProvider;

    let xAxis = viewer.entities.add({
        name : 'X axis',
        polyline : {
            positions : [new Cesium.Cartesian3(0.000001, 0, 0), new Cesium.Cartesian3(10000000, 0, 0)],
            width : 10,
            arcType : Cesium.ArcType.NONE,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(1.0, 0, 0, 0.2))
        }
    });

    let yAxis = viewer.entities.add({
        name : 'Y axis',
        polyline : {
            positions : [new Cesium.Cartesian3(0, 0.000001, 0), new Cesium.Cartesian3(0, 10000000, 0)],
            width : 10,
            arcType : Cesium.ArcType.NONE,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 1, 0, 0.2))
        }
    });

    let zAxis = viewer.entities.add({
        name : 'Z axis',
        polyline : {
            positions : [new Cesium.Cartesian3(0, 0, 0.000001), new Cesium.Cartesian3(0, 0, 10000000)],
            width : 10,
            arcType : Cesium.ArcType.NONE,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 0, 1, 0.2))
        }
    });

    let terrainCheckbox = document.getElementById('terrain');

    terrainCheckbox.addEventListener('change', (event) => {

        console.log(event);

        if (event.target.checked) {

            viewer.terrainProvider = cesiumWorldTerrainProvider;
        
        } else {

            viewer.terrainProvider = ellipsoidTerrainProvider;
        }
    });
});