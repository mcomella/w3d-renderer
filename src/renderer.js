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
- Allocation for createImageData in render loop.
*/

import { BLOCK_SIZE, WALL_HEIGHT_SCALE_FACTOR } from './config.js';
import { demoMap, demoLightTexture, demoDarkTexture } from './demoAssets.js';
import * as rcMath from './rcMath.js';
import { getWallDist, drawWallImpl } from "./rendererImplSwitcher.js";
import { assert } from './util.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 * @param {import("./rcMath").Point} playerLoc
 * @param {number} playerAngle
 */
export function renderFrame(ctx, resolution, playerLoc, playerAngle, textures) {
    clearFrame(ctx, resolution);
    drawWalls(ctx, resolution, playerLoc, playerAngle, textures);
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
function drawWalls(ctx, resolution, playerLoc, thetaPlayer, textures) {
    // This expression hardcodes the same field of view as in w3d (I think).
    const thetaLeftmostFoV = thetaPlayer - resolution.width / 2 / 10;

    // For each column of pixels on the monitor...
    for (let pixelColumnNum = 0; pixelColumnNum < resolution.width; pixelColumnNum++) {
        // Cast a ray from the field of view. Note: theta 0 is pointing up, y increases down.
        const ray = new Ray(thetaLeftmostFoV + pixelColumnNum / 10);
        let xintercept = getFirstRayToGridXIntercept(playerLoc, ray);
        let yintercept = getFirstRayToGridYIntercept(playerLoc, ray);
        const xinterceptSteps = getXInterceptSteps(ray);
        const yinterceptSteps = getYInterceptSteps(ray);

        // Cast the ray to each point in the grid until we intersect a wall.
        while (true) {
            const xinterceptDist = rcMath.getDistance(xintercept, playerLoc);
            const yinterceptDist = rcMath.getDistance(yintercept, playerLoc);
            const closestIntercept = (xinterceptDist < yinterceptDist) ? xintercept : yintercept;
            const isIntersectOnXGridLine  = xinterceptDist < yinterceptDist;

            if (doesLocationIntersectWall(demoMap.tiles, closestIntercept, isIntersectOnXGridLine, ray)) {
                const closestInterceptDist = (xinterceptDist < yinterceptDist) ? xinterceptDist : yinterceptDist;
                const wallDist = getWallDist(closestInterceptDist, closestIntercept, playerLoc, thetaPlayer, ray.theta);
                drawWall(ctx, resolution, pixelColumnNum, wallDist, isIntersectOnXGridLine, closestIntercept, textures);
                break;
            }

            // TODO: assert not longer than map to avoid infinite loops?
            if (isIntersectOnXGridLine) {
                xintercept = {x: xintercept.x + xinterceptSteps.xStep, y: xintercept.y + xinterceptSteps.yStep};
            } else {
                yintercept = {x: yintercept.x + yinterceptSteps.xStep, y: yintercept.y + yinterceptSteps.yStep};
            }
        }
    }
}

/**
 * @param {string[][]} map
 * @param {import("./config").Point} location
 * @param {boolean} isIntersectOnXGridLine
 * @param {Ray} ray
 * @returns {boolean}
 */
function doesLocationIntersectWall(map, location, isIntersectOnXGridLine, ray) {
    // An intersection will be one grid point and one in between grid point,
    // e.g. (1, 2.3): we floor to conform to the grid.
    const mapSpaceLoc = {x: Math.floor(location.x / BLOCK_SIZE), y: Math.floor(location.y / BLOCK_SIZE)};

    // TODO: I don't think we need to check [y][x] if we're facing negative but I didn't get it working.
    assert(mapSpaceLoc.x < map.length, () => `expected < ${map.length}. got ${mapSpaceLoc.x}`);
    assert(mapSpaceLoc.y < map.length, () => `expected < ${map.length}. got ${mapSpaceLoc.y}`);
    return map[mapSpaceLoc.y][mapSpaceLoc.x] === 'w' ||
            // Each tile in the map object is a block - it has four walls - so we need to check for
            // intersection with all four. If we're facing in a negative direction, we need to project
            // the tile forward; this comes for free in a positive direction.
            (isIntersectOnXGridLine && ray.xDirMultiplier < 0 &&
                    mapSpaceLoc.x > 0 && map[mapSpaceLoc.y][mapSpaceLoc.x - 1] === 'w') ||
            (!isIntersectOnXGridLine && ray.yDirMultiplier < 0 &&
                    mapSpaceLoc.y > 0 && map[mapSpaceLoc.y - 1][mapSpaceLoc.x] === 'w');
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./config").Resolution} resolution
 * @param {number} columnNum
 * @param {number} distance
 */
function drawWall(ctx, resolution, columnNum, distance, isIntersectOnXGridLine, intercept, textures) {
    // Note: for impl simplicity, this draws outside the canvas. Is that a (perf) problem?
    // Seems like yes, e.g. if we're right right next to a wall. But we need to know actual height
    // so we can texture it correctly.
    const wallHeight = Math.round(WALL_HEIGHT_SCALE_FACTOR / Math.max(distance, 0.1));
    const y0 = Math.round(resolution.height / 2 - wallHeight / 2);

    // TODO: restore demo textures.
    const texture = isIntersectOnXGridLine ? textures[0] : textures[1];
    drawWallImpl(ctx, isIntersectOnXGridLine, columnNum, y0, wallHeight, texture, intercept);
}

function getXInterceptSteps(ray) {
    if (ray.xDirMultiplier === 0) {
        // Line is vertical and this method would fail: return no changes to our dummy position.
        return {xStep: 0, yStep: 0};
    }

    const dx = BLOCK_SIZE * ray.xDirMultiplier;
    return {
        xStep: dx,
        yStep: -dx / rcMath.tanDeg(ray.theta),
    };
}

function getYInterceptSteps(ray) {
    if (ray.yDirMultiplier === 0) {
        // Line is horizontal and this method would fail: return no changes to our dummy position.
        return {xStep: 0, yStep: 0};
    }

    const dy = BLOCK_SIZE * ray.yDirMultiplier;
    return {
        xStep: -dy * rcMath.tanDeg(ray.theta),
        yStep: dy,
    };
}

/**
 * @param {import("./rcMath").Point} playerLoc
 * @param {Ray} ray
 */
function getFirstRayToGridXIntercept(playerLoc, ray) {
    if (ray.xDirMultiplier === 0) {
        // Line is vertical and this method would fail: return a large value so yIntercept will always be closer.
        return {x: Number.MAX_VALUE / 2, y: Number.MAX_VALUE / 2};
    }

    // We're "floor/ceil"ing playerX to the nearest gridline, i.e. a possible wall location.
    const roundingFn = ray.xDirMultiplier === 1 ? Math.ceil : Math.floor;
    const xIntercept = roundingFn(playerLoc.x / BLOCK_SIZE) * BLOCK_SIZE;

    const dx = xIntercept - playerLoc.x;
    return {
        x: xIntercept,
        y: -dx / rcMath.tanDeg(ray.theta) + playerLoc.y, // derived via soh-cah-TOA.
    };
}

/**
 * @param {import("./rcMath").Point} playerLoc
 * @param {Ray} ray
 */
function getFirstRayToGridYIntercept(playerLoc, ray) {
    if (ray.yDirMultiplier === 0) {
        // Line is horizontal and this method would fail: return a large value so yIntercept will always be closer.
        return {x: Number.MAX_VALUE / 2, y: Number.MAX_VALUE / 2};
    }

    // We're "floor/ceil"ing playerY to the nearest gridline, i.e. a possible wall location.
    const roundingFn = ray.yDirMultiplier === 1 ? Math.ceil : Math.floor;
    const yIntercept = roundingFn(playerLoc.y / BLOCK_SIZE) * BLOCK_SIZE;

    const dy = yIntercept - playerLoc.y;
    return {
        x: -dy * rcMath.tanDeg(ray.theta) + playerLoc.x, // derived via soh-cah-TOA.
        y: yIntercept,
    };
}

function Ray(theta) {
    this.theta = theta; // constant from field of view
    this.xDirMultiplier = Math.sign(rcMath.sinDeg(theta));
    this.yDirMultiplier = -Math.sign(rcMath.cosDeg(theta)); // negative b/c y points down.
}

export const testables = {
    getFirstRayToGridXIntercept, getFirstRayToGridYIntercept,
    getXInterceptSteps, getYInterceptSteps,
};
