import * as rcMath from './rcMath.js';
import { assert } from './util.js';

///////////////////////////////////////////////////////////////////////////////
// Implementations for getWallDist: we need to measure the distance from the
// intersection point to the camera plane.
///////////////////////////////////////////////////////////////////////////////
export const getWallDist = getWallDistDirectExpensive;

/** naive impl: causes fisheye. is naive impl that is distance from player to intersect. */
// eslint-disable-next-line no-unused-vars
function getWallDistFisheye(closestInterceptDist) {
    return closestInterceptDist;
}

/** expensive due to unnecessary distance calc, I think. I derived this. */
// eslint-disable-next-line no-unused-vars
function getWallDistDirectExpensive(closestInterceptDist, interceptLoc, playerLoc, thetaPlayer, thetaRay) {
    return closestInterceptDist * rcMath.cosDeg(thetaPlayer - thetaRay);
}

/** cheap calc from w3d. */
// eslint-disable-next-line no-unused-vars
function getWallDistW3d(closestInterceptDist, interceptLoc, playerLoc, playerAngle) {
    // TODO: broken! I never got this working.
    const dx = interceptLoc.x - playerLoc.x;
    const dy = interceptLoc.y - playerLoc.y;
    return Math.abs(dx * rcMath.cosDeg(playerAngle) + dy * rcMath.sinDeg(playerAngle));
}

///////////////////////////////////////////////////////////////////////////////
// Implementations for drawWallImpl: we draw the wall, perhaps textured.
///////////////////////////////////////////////////////////////////////////////
export const drawWallImpl = drawTexturedWallOneColumn;

// eslint-disable-next-line no-unused-vars
function drawTexturedWallOneColumn(ctx, isIntersectX, columnNum, y0, wallHeight, lightTexture, darkTexture) {
    const texture = isIntersectX ? lightTexture : darkTexture;
    const scaleMultipiler = texture.length / 4 / wallHeight; // 4 to account for RGBA.
    function getTextureIndex(i) {
        // Alternative algo: 1) ceil. 2) split in half & interpolate central point.
        return Math.floor((i / 4) * scaleMultipiler) * 4;
    }

    const imageData = ctx.createImageData(1, wallHeight);
    const data = imageData.data;
    assert(getTextureIndex(data.length - 3) < texture.length, () =>
            `will read after texture array ${data.length - 3} ${texture.length} ${scaleMultipiler}`);

    for (let i = 0; i < data.length; i += 4) {
        const textureIndex = getTextureIndex(i);
        data[i] = texture[textureIndex];
        data[i + 1] = texture[textureIndex + 1];
        data[i + 2] = texture[textureIndex + 2];
        data[i + 3] = texture[textureIndex + 3];
    }
    ctx.putImageData(imageData, columnNum, y0);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
// eslint-disable-next-line no-unused-vars
function drawWallNoTexture(ctx, isIntersectX, columnNum, y0, wallHeight) {
    ctx.fillStyle = isIntersectX ? '#00f' : '#00a';
    ctx.fillRect(/* x */ columnNum, /* y */ y0, /* width */ 1, /* height */ wallHeight);
}
