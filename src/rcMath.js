/**
 * @param {number} degrees
 * @returns {number}
 */
export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * @param {number} degrees
 * @returns {number}
 */
export function sinDeg(degrees) {
    const result = Math.sin(toRadians(degrees));
    return Math.abs(result) <= Number.EPSILON ? 0 : result;
}

/**
 * @param {number} degrees
 * @returns {number}
 */
export function cosDeg(degrees) {
    const result = Math.cos(toRadians(degrees));
    return Math.abs(result) <= Number.EPSILON ? 0 : result;
}

/**
 * @param {number} degrees
 * @returns {number} tangent of degrees. Instead of returning undefined for 90,
 * it returns an asymptotically large number, like JS' version of the function.
 * This doesn't matter for us because the angle should never approach 90 in a
 * right triangle. In general, rounding here is weird (e.g. tan 45).
 */
export function tanDeg(degrees) {
    const result = Math.tan(toRadians(degrees));
    return Math.abs(result) <= Number.EPSILON ? 0 : result;
}

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 */
export function getDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * @param {number} angle
 * @returns {number}
 */
export function adjustAngleTo360(angle) {
    while (angle >= 360) angle -= 360;
    while (angle < 0) angle += 360;
    return angle;
}
