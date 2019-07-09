
const DEBUG = true;

var viewer;

$(document).ready(function () {

    viewer = new Cesium.Viewer('cesiumContainer', {
        selectionIndicator: false
    });

    viewer.camera.setView({
        destination : Cesium.Cartesian3.fromDegrees(121.516946, 25.0477, 250),
        orientation: {
            heading : 0.0,
            pitch : Cesium.Math.toRadians(-45),
            roll : 0.0
        }
    });
    
    $("input[name='focal']").val(24);
});


$("input[name='focal'], input[name='sensor']").change(() => {

    let focalLength = $('input[name="focal"]').val();

    // update UI
    $("#focal-value").text(focalLength + 'mm');

    let sensor = $('input[name="sensor"]:checked').val();
    let cropRatio = 1;

    console.log(sensor);

    switch (sensor) {
        case 'ff':
            cropRatio = 1;
            break;
        case 'apsc-nikon':
            cropRatio = 1.5;
            break;
        case 'apsc-canon':
            cropRatio = 1.6;
            break;
        case 'm43':
            cropRatio = 2;
            break;
        case '1inch':
            cropRatio = 2.7;
            break;
        case 'phone':
            cropRatio = 6;
            break;
    }

    // apply crop ratio onto focal length
    // convert focal length to 35mm focal length equivalent (35mm等效焦段)
    focalLength = focalLength * cropRatio;

    console.log(focalLength);

    // m43 sensor's aspect ratio is different from others
    if (sensor == 'm43') {
        $('#cesiumContainer').css('height', '450px');
    } else {
        $('#cesiumContainer').css('height', '400px');
    }

    // calculate view angle, check: https://en.wikipedia.org/wiki/Angle_of_view
    let horizontalAngle = 2 * Math.atan(36 / (2*focalLength)); // in radians
    let verticalAngle = 2 * Math.atan(24 / (2*focalLength)); // in radians

    $("#horizontal-angle").text(Math.floor(horizontalAngle*(180/Math.PI) * 100) / 100);
    $("#vertical-angle").text(Math.floor(verticalAngle*(180/Math.PI) * 100) / 100);

    // apply view angle on cesium.viewer.camera.frustrum.fov
    // fov's value will apply on viewer's longer side (in this page, horizontal direction is longer)
    viewer.camera.frustum.fov = horizontalAngle;
});