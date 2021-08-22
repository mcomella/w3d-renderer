// A collection of different implementations for getIntersectToCameraPlaneDist: the value we
// need to project a casted-ray to wall intersection back to the camera plane.

import * as rcMath from './rcMath.js';

export const getWallDistImpl = directImplExpensive;

/** naive impl: causes fisheye. is distance from player to intersect. */
function fisheyeImpl(closestInterceptDist) {
    return closestInterceptDist;
}

/** expensive due to unnecessary distance calc, I think. I derived this. */
function directImplExpensive(closestInterceptDist, intersectLoc, playerLoc, playerAngle, rayAngle) {
    return closestInterceptDist * rcMath.cosDeg(Math.abs(playerAngle - rayAngle));
}

/** TODO: broken! cheap calc from W3D. */
function w3dImpl(closestInterceptDist, intersectLoc, playerLoc, playerAngle) {
    const dx = intersectLoc.x - playerLoc.x;
    const dy = intersectLoc.y - playerLoc.y;
    return Math.abs(dx * rcMath.cosDeg(playerAngle) + dy * rcMath.sinDeg(playerAngle));
}
