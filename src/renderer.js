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
*/

import { maps } from "./maps.js";
import * as rcMath from './rcMath.js';

const WALL_WIDTH = 8; // ft.

const map = maps[0];

let angle = 180;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 */
export function renderFrame(ctx, resolution) {
    clearFrame(ctx, resolution);
    drawWalls(ctx, resolution, {x: 15, y: 33}, angle);
    angle += 0.75;
    if (angle >= 360) {
        angle = 0;
    }
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
    ctx.fillStyle = '#222';
    ctx.fillRect(0, resolution.height / 2, resolution.width, resolution.height);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 * @param {Point} playerLoc
 * @param {number} playerAngle
 */
function drawWalls(ctx, resolution, playerLoc, playerAngle) {
    // TODO: is startAngle correct? i.e. rounding errors with resolution.width and no off-by-one?
    // Column refers to the physical column of pixels we will draw on the monitor.

    // TODO: adjustment unnecessary?
    const startAngle = adjustAngleForCircleOverflow(playerAngle - resolution.width / 2 / 10); // TODO: explain 10 const.
    for (let columnNum = 0; columnNum < resolution.width; columnNum++) {
        // Origin is pointing vertically up even though y increases downwards.
        const colAngleFromOrigin = adjustAngleForCircleOverflow(startAngle + columnNum / 10); // TODO: explain 10.
        if (colAngleFromOrigin === 0 || colAngleFromOrigin === 180) {
            // TODO: ywalk special case.
            continue;
        } else if (colAngleFromOrigin === 90 || colAngleFromOrigin === 270) {
            // TODO: xwalk special case.
            continue;
        }

        let xintercept = getInitialXIntercept(playerLoc, colAngleFromOrigin);
        let yintercept = getInitialYIntercept(playerLoc, colAngleFromOrigin);
        // TODO: this shouldn't be current location.

        const xinterceptSteps = getXInterceptSteps(playerLoc, xintercept);
        const yinterceptSteps = getYInterceptSteps(playerLoc, xintercept);

        while (true) {
            const xinterceptDist = rcMath.getDistance(xintercept, playerLoc);
            const yinterceptDist = rcMath.getDistance(yintercept, playerLoc);
            const closestIntercept = (xinterceptDist < yinterceptDist) ? xintercept : yintercept; // TODO: okay what happens if equal?
            const closestInterceptDist = (xinterceptDist < yinterceptDist) ? xinterceptDist : yinterceptDist; // TODO: other algo

            if (isWall(closestIntercept)) {
                drawWall(ctx, columnNum, closestInterceptDist); // TODO: name collision
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
 * @param {number} columnNum
 * @param {number} distance
 */
function drawWall(ctx, columnNum, distance) {
    // If I'm 5' and the walls are 10', the wall fills my field of view around 8' away.
    // scalingFactor derivation: 10 = x / 8. x/scalingFactor = 80 IRL. This is in feet.
    // In game, if walls are 8' tall, then 8 = 80 / d. d = 10. So I must be 10' ft away
    // to fill the field of view.
    // So at 10ft away, the height should be 200px. 200 = s / 10. Scaling factor = 2000.
    const scalingFactor = 2000;
    const wallHeight = Math.round(scalingFactor / distance);
    const y0 = 200 / 2 - wallHeight / 2; // TODO: off by one? hard-coded res. subpixel.

    ctx.fillStyle = '#00f';
    ctx.fillRect(columnNum, y0, 1, wallHeight);
}

function getXInterceptSteps(playerLoc, xintercept) {
    const xstep = WALL_WIDTH * Math.sign(xintercept.x - playerLoc.x);
    return {
        xStep: xstep,
        yStep: xstep * ((xintercept.y - playerLoc.y) / (xintercept.x - playerLoc.x)),
    };
}

function getYInterceptSteps(playerLoc, xintercept) {
    const ystep = WALL_WIDTH * Math.sign(xintercept.y - playerLoc.y);
    return {
        xStep: ystep * ((xintercept.x - playerLoc.x) / (xintercept.y - playerLoc.y)),
        yStep: ystep,
    };
}

/**
 * Even though angle > 90 breaks soh-cah-toa, I think it tan(theta)
 * does the right thing when the angle is larger.
 *
 * @param {Point} playerLoc
 * @param {number} rayAngle
 */
function getInitialXIntercept(playerLoc, rayAngle) {
    // TODO: should we handle negative & overflow angles?
    if (rayAngle === 0 || rayAngle === 180) { // could do Math.abs(angle) % 180 === 0
        throw Exception('Cannot determine xintercept of vertical line');
    }

    // We're "floor/ceil"ing to the nearest gridline. e.g. if we're decreasing in the grid,
    // wall_width = 8, and playerLoc = 12, Math.floor(12 / 8) = 1. 1 * 8 = 8;
    const roundingFn = rayAngle < 180 ? Math.ceil : Math.floor;
    const xintx = roundingFn(playerLoc.x / WALL_WIDTH) * WALL_WIDTH;
    const deltaY = (xintx - playerLoc.x) / rcMath.tanDeg(rayAngle); // derived from soh-cah-TOA.
    const xinty = playerLoc.y - deltaY;
    return {
        x: xintx,
        y: xinty,
    };
}

/**
 * @param {Point} playerLoc
 * @param {number} rayAngle
 */
function getInitialYIntercept(playerLoc, rayAngle) {
    if (rayAngle === 90 || rayAngle === 270) {
        throw Exception('Cannot determine yintercept of horizontal line');
    }

    // We're "floor/ceil"ing to the nearest gridline. e.g. if we're decreasing in the grid,
    // wall_width = 8, and playerLoc = 12, Math.floor(12 / 8) = 1. 1 * 8 = 8;
    const roundingFn = rayAngle < 90 || rayAngle > 270 ? Math.floor : Math.ceil;
    const yinty = roundingFn(playerLoc.y / WALL_WIDTH) * WALL_WIDTH;
    const deltaX = (yinty - playerLoc.y) * rcMath.tanDeg(rayAngle); // derived from soh-cah-TOA.
    const yintx = playerLoc.x - deltaX;
    return {
        x: yintx,
        y: yinty,
    };
}

/**
 * @param {number} angle
 * @returns {number}
 */
function adjustAngleForCircleOverflow(angle) {
    // TODO: a circle has 360 degrees. So no degree 0?
    let finalAngle;
    if (angle >= 360) { // TODO: constants
        finalAngle = angle - 360;
    } else if (angle < 0) {
        finalAngle = angle + 360;
    } else {
        finalAngle = angle;
    }
    return finalAngle;
}

export const testables = {
    getInitialXIntercept, getInitialYIntercept,
    getXInterceptSteps, getYInterceptSteps,
};
