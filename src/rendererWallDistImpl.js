// A collection of different implementations for getWallDist: we need to
// measure the distance from the intersection point to the camera plane.

import * as rcMath from './rcMath.js';

export const getWallDist = directImplExpensive;

/** naive impl: causes fisheye. is naive impl that is distance from player to intersect. */
// eslint-disable-next-line no-unused-vars
function fisheyeImpl(closestInterceptDist) {
    return closestInterceptDist;
}

/** expensive due to unnecessary distance calc, I think. I derived this. */
// eslint-disable-next-line no-unused-vars
function directImplExpensive(closestInterceptDist, interceptLoc, playerLoc, thetaPlayer, thetaRay) {
    return closestInterceptDist * rcMath.cosDeg(thetaPlayer - thetaRay);
}

/** cheap calc from w3d. */
// eslint-disable-next-line no-unused-vars
function w3dImpl(closestInterceptDist, interceptLoc, playerLoc, playerAngle) {
    // TODO: broken! I never got this working.
    const dx = interceptLoc.x - playerLoc.x;
    const dy = interceptLoc.y - playerLoc.y;
    return Math.abs(dx * rcMath.cosDeg(playerAngle) + dy * rcMath.sinDeg(playerAngle));
}
