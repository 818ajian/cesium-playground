# 3D performance optimization

## How 3D Tiles' geometricError and ScreenSpaceError works?

* tile's geometricError is a static value, it should equal to tile's sphere radius, in meters.
* tile's screen space error will be re-calculated while camera is moving, the calculating function is shown below, tile's SSE(screen space error) is directly proportional to `geometricError / distance to camera`. When camera is close to the tile, tile's SSE will be large; When camera is far from the tile, tile's SSE will be close to 0.

```js

Cesium3DTile.prototype.getScreenSpaceError = function(frameState, useParentGeometricError, progressiveResolutionHeightFraction) {
    var tileset = this._tileset;
    var heightFraction = defaultValue(progressiveResolutionHeightFraction, 1.0);
    var parentGeometricError = defined(this.parent) ? this.parent.geometricError : tileset._geometricError;
    var geometricError = useParentGeometricError ? parentGeometricError : this.geometricError;
    if (geometricError === 0.0) {
        // Leaf tiles do not have any error so save the computation
        return 0.0;
    }
    var camera = frameState.camera;
    var frustum = camera.frustum;
    var context = frameState.context;
    var width = context.drawingBufferWidth;
    var height = context.drawingBufferHeight * heightFraction;
    var error;
    if (frameState.mode === SceneMode.SCENE2D || frustum instanceof OrthographicFrustum) {
        if (defined(frustum._offCenterFrustum)) {
            frustum = frustum._offCenterFrustum;
        }
        var pixelSize = Math.max(frustum.top - frustum.bottom, frustum.right - frustum.left) / Math.max(width, height);
        error = geometricError / pixelSize;
    } else {
        // Avoid divide by zero when viewer is inside the tile
        var distance = Math.max(this._distanceToCamera, CesiumMath.EPSILON7);
        var sseDenominator = camera.frustum.sseDenominator;
        error = (geometricError * height) / (distance * sseDenominator);
        if (tileset.dynamicScreenSpaceError) {
            var density = tileset._dynamicScreenSpaceErrorComputedDensity;
            var factor = tileset.dynamicScreenSpaceErrorFactor;
            var dynamicError = CesiumMath.fog(distance, density) * factor;
            error -= dynamicError;
        }
    }
    return error;
};

```

when a tile's SSE is greater than `3DTileset.maximumScreenSpaceError`, it refines to its descendants.