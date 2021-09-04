/*
known perf improvements:
- don't round trig. use trig lookup tables.
- more efficient to draw columns or rows? maybe we don't have a choice.
- don't allocate in inner loop
- remove adjustCircle recursion. Unroll the loop to lose generics
- no assertions, e.g. getXIntercept
- Maybe this has since been optimized:
    https://www.html5rocks.com/en/tutorials/canvas/performance/
- getContext('2d', { alpha: false })
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
- x/yInterceptDist doesn't need hypot. Can just use x/y coordinates? e.g. if angle is 0-90, then smallest x is closest.
*/

import { WALL_HEIGHT_SCALE_FACTOR } from './config.js';
import * as rcMath from './rcMath.js';
import { getWallDist } from "./rendererWallDistImpl.js";
import { assert } from "./util.js";

const BLOCK_SIZE = 8; // ft.

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 * @param {import("./rcMath").Point} playerLoc
 * @param {number} playerAngle
 */
export function renderFrame(ctx, resolution, playerLoc, playerAngle) {
    clearFrame(ctx, resolution);
    drawWalls(ctx, resolution, playerLoc, playerAngle);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 */
function clearFrame(ctx, resolution) {
    // Ceiling
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, resolution.width, resolution.height / 2);

    // Floor
    ctx.fillStyle = '#555';
    ctx.fillRect(0, resolution.height / 2, resolution.width, resolution.height);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 * @param {import("./rcMath").Point} playerLoc
 * @param {number} playerAngle
 */
function drawWalls(ctx, resolution, playerLoc, playerAngle) {
    // TODO: is startAngle correct? i.e. rounding errors with resolution.width and no off-by-one?
    // Column refers to the physical column of pixels we will draw on the monitor.

    // TODO: adjustment unnecessary?
    const thetaStart = rcMath.adjustAngleTo360(playerAngle - resolution.width / 2 / 10); // TODO: explain 10 const.
    for (let columnNum = 0; columnNum < resolution.width; columnNum++) {
        // Origin is pointing vertically up even though y increases downwards.
        const thetaRay = rcMath.adjustAngleTo360(thetaStart + columnNum / 10); // TODO: explain 10.
        if (thetaRay === 0 || thetaRay === 180) {
            // TODO: ywalk special case.
            continue;
        } else if (thetaRay === 90 || thetaRay === 270) {
            // TODO: xwalk special case.
            continue;
        }

        let xintercept = getFirstRayToGridXIntercept(playerLoc, thetaRay);
        let yintercept = getFirstRayToGridYIntercept(playerLoc, thetaRay);
        // TODO: this shouldn't be current location. infinite loop.

        const xinterceptSteps = getXInterceptSteps(playerLoc, xintercept, thetaRay);
        const yinterceptSteps = getYInterceptSteps(playerLoc, xintercept, thetaRay);

        while (true) {
            const xinterceptDist = rcMath.getDistance(xintercept, playerLoc);
            const yinterceptDist = rcMath.getDistance(yintercept, playerLoc);
            const closestIntercept = (xinterceptDist < yinterceptDist) ? xintercept : yintercept; // TODO: okay what happens if equal?

            if (isWall(closestIntercept)) {
                const closestInterceptDist = (xinterceptDist < yinterceptDist) ? xinterceptDist : yinterceptDist;
                const isIntersectX  = xinterceptDist < yinterceptDist;
                const wallDist = getWallDist(closestInterceptDist, closestIntercept, playerLoc, playerAngle, thetaRay);
                drawWall(ctx, resolution, columnNum, wallDist, isIntersectX); // TODO: name collision
                break;
            }

            // TODO: assert not longer than map? Just in case I f'd up. No infinite loop. is isWall?
            // Otherwise, get next x/y (why?). b/c we're stepping.
            if (closestIntercept === xintercept) {
                xintercept = {
                    x: xintercept.x + xinterceptSteps.xStep,
                    y: xintercept.y + xinterceptSteps.yStep,
                };
            } else {
                yintercept = { // TODO: can be func.
                    x: yintercept.x + yinterceptSteps.xStep,
                    y: yintercept.y + yinterceptSteps.yStep,
                };
            }
        }
    }
}

// TODO: name.
function isWall(location) {
    if (location.x == 0 || location.x == 64) {
        return true;
    } else if (location.y == 0 || location.y == 64) {
        return true;
    }
    return false;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 * @param {number} columnNum
 * @param {number} distance
 */
function drawWall(ctx, resolution, columnNum, distance, isIntersectX) {
    // Note: for impl simplicity, this draws outside the canvas. Is that a (perf) problem?
    const wallHeight = Math.round(WALL_HEIGHT_SCALE_FACTOR / distance);
    const y0 = Math.round(resolution.height / 2 - wallHeight / 2);

    // Changing the color between x/y intersections changes the lighting, improving
    // the perception of perspective.
    ctx.fillStyle = isIntersectX ? '#00f' : '#00a';
    ctx.fillRect(/* x */ columnNum, /* y */ y0, /* width */ 1, wallHeight);
}

function getXInterceptSteps(playerLoc, xintercept, thetaRay) {
    assert(thetaRay != 0 && thetaRay != 180); // TODO: is never negative? Also Math.abs(angle) % 180
    const dx = BLOCK_SIZE * Math.sign(xintercept.x - playerLoc.x);
    return {
        xStep: dx,
        yStep: -dx / rcMath.tanDeg(thetaRay),
    };
}

function getYInterceptSteps(playerLoc, xintercept, thetaRay) {
    assert(thetaRay != 90 && thetaRay != 270);
    const dy = BLOCK_SIZE * Math.sign(xintercept.y - playerLoc.y);
    return {
        xStep: -dy * rcMath.tanDeg(thetaRay),
        yStep: dy,
    };
}

/**
 * @param {import("./rcMath").Point} playerLoc
 * @param {number} thetaRay
 */
function getFirstRayToGridXIntercept(playerLoc, thetaRay) {
    // TODO: should we handle negative & overflow angles?
    assert(thetaRay != 0 && thetaRay != 180); // TODO: is always negative?

    // We're "floor/ceil"ing playerX to the nearest gridline, i.e. a possible wall location.
    const roundingFn = thetaRay < 180 ? Math.ceil : Math.floor;
    const xIntercept = roundingFn(playerLoc.x / BLOCK_SIZE) * BLOCK_SIZE;

    const dx = xIntercept - playerLoc.x;
    return {
        x: xIntercept,
        y: -dx / rcMath.tanDeg(thetaRay) + playerLoc.y, // derived via soh-cah-TOA.
    };
}

/**
 * @param {import("./rcMath").Point} playerLoc
 * @param {number} thetaRay
 */
function getFirstRayToGridYIntercept(playerLoc, thetaRay) {
    assert(thetaRay != 90 && thetaRay != 270);

    // We're "floor/ceil"ing playerY to the nearest gridline, i.e. a possible wall location.
    const roundingFn = thetaRay < 90 || thetaRay > 270 ? Math.floor : Math.ceil;
    const yIntercept = roundingFn(playerLoc.y / BLOCK_SIZE) * BLOCK_SIZE;

    const dy = yIntercept - playerLoc.y;
    return {
        x: -dy * rcMath.tanDeg(thetaRay) + playerLoc.x, // derived via soh-cah-TOA.
        y: yIntercept,
    };
}

export const testables = {
    getFirstRayToGridXIntercept, getFirstRayToGridYIntercept,
    getXInterceptSteps, getYInterceptSteps,
};
