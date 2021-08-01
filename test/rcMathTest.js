import * as assert from 'assert/strict';
import * as rcMath from '../src/rcMath.js';

describe('toRadians', () => {
    it('returns correctly for common angles', () => {
        assert.strictEqual(0, rcMath.toRadians(0));
        assert.strictEqual(0.25 * Math.PI, rcMath.toRadians(45));
        assert.strictEqual(0.5 * Math.PI, rcMath.toRadians(90));
        assert.strictEqual(Math.PI, rcMath.toRadians(180));
        assert.strictEqual(1.5 * Math.PI, rcMath.toRadians(270));
        assert.strictEqual(2 * Math.PI, rcMath.toRadians(360));
    });
});

describe('sinDeg', () => {
    it('returns correctly for common angles', () => {
        assert.strictEqual(rcMath.sinDeg(0), 0);
        assert.strictEqual(rcMath.sinDeg(90), 1);
        assert.strictEqual(rcMath.sinDeg(180), 0);
        assert.strictEqual(rcMath.sinDeg(270), -1);
    });

    it('returns correctly for negative common angles', () => {
        assert.strictEqual(rcMath.sinDeg(-90), -1);
        assert.strictEqual(rcMath.sinDeg(-180), 0);
        assert.strictEqual(rcMath.sinDeg(-270), 1);
    });

    it('returns correctly within epsilon for overflow common angles', () => {
        assertEqualEpsilon(rcMath.sinDeg(360), 0);
        assertEqualEpsilon(rcMath.sinDeg(450), 1);
        assertEqualEpsilon(rcMath.sinDeg(540), 0);
        assertEqualEpsilon(rcMath.sinDeg(630), -1);
        assertEqualEpsilon(rcMath.sinDeg(720), 0);

        assertEqualEpsilon(rcMath.sinDeg(-360), 0);
        assertEqualEpsilon(rcMath.sinDeg(-450), -1);
        assertEqualEpsilon(rcMath.sinDeg(-540), 0);
        assertEqualEpsilon(rcMath.sinDeg(-630), 1);
        assertEqualEpsilon(rcMath.sinDeg(-720), 0);
    });

    it('returns equal to radian values for lesser common angles', () => {
        assert.strictEqual(rcMath.sinDeg(30), Math.sin(Math.PI / 6));
        assert.strictEqual(rcMath.sinDeg(45), Math.sin(Math.PI / 4));
        assert.strictEqual(rcMath.sinDeg(60), Math.sin(Math.PI / 3));
    });
});

describe('cosDeg', () => {
    it('returns correctly for common angles', () => {
        assert.strictEqual(rcMath.cosDeg(0), 1);
        assert.strictEqual(rcMath.cosDeg(90), 0);
        assert.strictEqual(rcMath.cosDeg(180), -1);
        assert.strictEqual(rcMath.cosDeg(270), 0);
    });

    it('returns correctly for negative common angles', () => {
        assert.strictEqual(rcMath.cosDeg(-90), 0);
        assert.strictEqual(rcMath.cosDeg(-180), -1);
        assert.strictEqual(rcMath.cosDeg(-270), 0);
    });

    it('returns correctly within epsilon for overflow common angles', () => {
        assertEqualEpsilon(rcMath.cosDeg(360), 1);
        assertEqualEpsilon(rcMath.cosDeg(450), 0);
        assertEqualEpsilon(rcMath.cosDeg(540), -1);
        assertEqualEpsilon(rcMath.cosDeg(630), 0);
        assertEqualEpsilon(rcMath.cosDeg(720), 1);

        assertEqualEpsilon(rcMath.cosDeg(-360), 1);
        assertEqualEpsilon(rcMath.cosDeg(-450), 0);
        assertEqualEpsilon(rcMath.cosDeg(-540), -1);
        assertEqualEpsilon(rcMath.cosDeg(-630), 0);
        assertEqualEpsilon(rcMath.cosDeg(-720), 1);
    });

    it('returns equal to radian values for lesser common angles', () => {
        assert.strictEqual(rcMath.cosDeg(30), Math.cos(Math.PI / 6));
        assert.strictEqual(rcMath.cosDeg(45), Math.cos(Math.PI / 4));
        assert.strictEqual(rcMath.cosDeg(60), Math.cos(Math.PI / 3));
    });
});

describe('tanDeg', () => {
    it('returns correctly for common angles', () => {
        assert.strictEqual(rcMath.tanDeg(0), 0);
        assert.strictEqual(rcMath.tanDeg(180), 0);

        // These asymptomtic values are not specific so we choose
        // the smallest one we see for future comparisons.
        let veryLargeNumber = Math.tan(Math.PI * 1.5); // tan 270
        assert.ok(rcMath.tanDeg(90) >= veryLargeNumber, rcMath.tanDeg(90));
        assert.ok(rcMath.tanDeg(270) >= veryLargeNumber, rcMath.tanDeg(270));

        let tan45 = rcMath.tanDeg(45);
        assert.ok(tan45 <= 1 && tan45 >= 1 - Number.EPSILON, tan45);
    });

    xit('returns correctly for negative common angles', () => {
        // TODO: expected values copied from cos or something.
        assertEqualEpsilon(rcMath.tanDeg(-45), 1); // broken
        // assert.strictEqual(rcMath.tanDeg(-90), 0); NaN
        assertEqualEpsilon(rcMath.tanDeg(-180), 0);
        // assert.strictEqual(rcMath.tanDeg(-270), 0);
    });

    xit('returns correctly for overflow common angles', () => {
        assert.strictEqual(rcMath.tanDeg(360), 1);
        assert.strictEqual(rcMath.tanDeg(450), 0); // broken
        assert.strictEqual(rcMath.tanDeg(540), -1);
        assert.strictEqual(rcMath.tanDeg(630), 0);
        assert.strictEqual(rcMath.tanDeg(720), 1);

        assert.strictEqual(rcMath.tanDeg(-360), 1);
    });
});

/**
 * @param {number} actual
 * @param {number} expected
 */
function assertEqualEpsilon(actual, expected) {
    // We use an epsilon multpiler because, in practice, rounding errors seem
    // to be larger than the min floating point round off.
    const epsilon = 3 * Number.EPSILON;
    const msg = `excepted: ${expected}. actual: ${actual}. epsilon: ${epsilon}`;
    assert.ok(expected + epsilon >= actual, msg);
    assert.ok(expected - epsilon <= actual, msg);
}
