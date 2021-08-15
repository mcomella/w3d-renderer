import * as assert from 'assert/strict';

/**
 * @param {number} actual
 * @param {number} expected
 */
export function assertEqualEpsilon(actual, expected, msg) {
    // We use an epsilon multpiler because, in practice, rounding errors seem
    // to be larger than the min floating point round off.
    const epsilon = 6 * Number.EPSILON;
    const finalMsg = `${msg}. excepted: ${expected}. actual: ${actual}. epsilon: ${epsilon}`;
    assert.ok(expected + epsilon >= actual, finalMsg);
    assert.ok(expected - epsilon <= actual, finalMsg);
}

/**
 * @param {import("../../src/rcMath").Point} actual
 * @param {import("../../src/rcMath").Point} expected
 */
export function assertEqualPointEpsilon(actual, expected) {
    assertEqualEpsilon(actual.x, expected.x, 'x');
    assertEqualEpsilon(actual.y, expected.y, 'y');
}
