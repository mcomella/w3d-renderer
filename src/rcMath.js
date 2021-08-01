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
    let adjustedResult;
    if (Math.abs(result) <= Number.EPSILON) {
        adjustedResult = 0;
    } else {
        adjustedResult = result;
    }
    return adjustedResult;
}
