// A collection of different implementations for getIntersectToCameraPlaneDist: the value we
// need to project a casted-ray to wall intersection back to the camera plane.

import * as rcMath from './rcMath.js';

export const getWallDistImpl = directImplExpensive;

/** naive impl: causes fisheye. is distance from player to intersect. */
// eslint-disable-next-line no-unused-vars
function fisheyeImpl(closestInterceptDist) {
    return closestInterceptDist;
}

/** expensive due to unnecessary distance calc, I think. I derived this. */
// eslint-disable-next-line no-unused-vars
function directImplExpensive(closestInterceptDist, intersectLoc, playerLoc, playerAngle, rayAngle) {
    return closestInterceptDist * rcMath.cosDeg(Math.abs(playerAngle - rayAngle));
}

/** TODO: broken! cheap calc from W3D. */
// eslint-disable-next-line no-unused-vars
function w3dImpl(closestInterceptDist, intersectLoc, playerLoc, playerAngle) {
    const dx = intersectLoc.x - playerLoc.x;
    const dy = intersectLoc.y - playerLoc.y;
    return Math.abs(dx * rcMath.cosDeg(playerAngle) + dy * rcMath.sinDeg(playerAngle));
}
