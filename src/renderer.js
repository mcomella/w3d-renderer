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
- don't need to calculate distance to see which intersect is closest. Can take sign & use x or y.
*/

import { BLOCK_SIZE, WALL_HEIGHT_SCALE_FACTOR } from './config.js';
import * as rcMath from './rcMath.js';
import { getWallDist } from "./rendererWallDistImpl.js";

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
 * @param {number} thetaPlayer
 */
function drawWalls(ctx, resolution, playerLoc, thetaPlayer) {
    // This expression hardcodes the same field of view as in w3d (I think).
    const thetaLeftmostFoV = thetaPlayer - resolution.width / 2 / 10;

    // For each column of pixels on the monitor...
    for (let pixelColumnNum = 0; pixelColumnNum < resolution.width; pixelColumnNum++) {
        // Cast a ray from the field of view. Note: theta 0 is pointing up, y increases down.
        const thetaRay = thetaLeftmostFoV + pixelColumnNum / 10; // constant from field of view
        const rayXDirMultiplier = Math.sign(rcMath.sinDeg(thetaRay));
        const rayYDirMultiplier = -Math.sign(rcMath.cosDeg(thetaRay)); // negative b/c y points down.

        let xintercept = getFirstRayToGridXIntercept(playerLoc, thetaRay, rayXDirMultiplier);
        let yintercept = getFirstRayToGridYIntercept(playerLoc, thetaRay, rayYDirMultiplier);
        const xinterceptSteps = getXInterceptSteps(thetaRay, rayXDirMultiplier);
        const yinterceptSteps = getYInterceptSteps(thetaRay, rayYDirMultiplier);

        // Cast the ray to each point in the grid until we intersect a wall.
        while (true) {
            const xinterceptDist = rcMath.getDistance(xintercept, playerLoc);
            const yinterceptDist = rcMath.getDistance(yintercept, playerLoc);
            const closestIntercept = (xinterceptDist < yinterceptDist) ? xintercept : yintercept;
            const isIntersectX  = xinterceptDist < yinterceptDist;

            if (isWall(closestIntercept)) {
                const closestInterceptDist = (xinterceptDist < yinterceptDist) ? xinterceptDist : yinterceptDist;
                const wallDist = getWallDist(closestInterceptDist, closestIntercept, playerLoc, thetaPlayer, thetaRay);
                drawWall(ctx, resolution, pixelColumnNum, wallDist, isIntersectX);
                break;
            }

            // TODO: assert not longer than map to avoid infinite loops?
            if (isIntersectX) {
                xintercept = {x: xintercept.x + xinterceptSteps.xStep, y: xintercept.y + xinterceptSteps.yStep};
            } else {
                yintercept = {x: yintercept.x + yinterceptSteps.xStep, y: yintercept.y + yinterceptSteps.yStep};
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

function getXInterceptSteps(thetaRay, rayXDirMultiplier) {
    if (rayXDirMultiplier === 0) {
        // Line is vertical and this method would fail: return no changes to our dummy position.
        return {xStep: 0, yStep: 0};
    }

    const dx = BLOCK_SIZE * rayXDirMultiplier;
    return {
        xStep: dx,
        yStep: -dx / rcMath.tanDeg(thetaRay),
    };
}

function getYInterceptSteps(thetaRay, rayYDirMultiplier) {
    if (rayYDirMultiplier === 0) {
        // Line is horizontal and this method would fail: return no changes to our dummy position.
        return {xStep: 0, yStep: 0};
    }

    const dy = BLOCK_SIZE * rayYDirMultiplier;
    return {
        xStep: -dy * rcMath.tanDeg(thetaRay),
        yStep: dy,
    };
}

/**
 * @param {import("./rcMath").Point} playerLoc
 * @param {number} thetaRay
 */
function getFirstRayToGridXIntercept(playerLoc, thetaRay, rayXDirMultiplier) {
    if (rayXDirMultiplier === 0) {
        // Line is vertical and this method would fail: return a large value so yIntercept will always be closer.
        return {x: Number.MAX_VALUE / 2, y: Number.MAX_VALUE / 2};
    }

    // We're "floor/ceil"ing playerX to the nearest gridline, i.e. a possible wall location.
    const roundingFn = rayXDirMultiplier === 1 ? Math.ceil : Math.floor;
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
function getFirstRayToGridYIntercept(playerLoc, thetaRay, rayYDirMultiplier) {
    if (rayYDirMultiplier === 0) {
        // Line is horizontal and this method would fail: return a large value so yIntercept will always be closer.
        return {x: Number.MAX_VALUE / 2, y: Number.MAX_VALUE / 2};
    }

    // We're "floor/ceil"ing playerY to the nearest gridline, i.e. a possible wall location.
    const roundingFn = rayYDirMultiplier === 1 ? Math.ceil : Math.floor;
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
