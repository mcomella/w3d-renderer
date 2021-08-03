import * as assert from 'assert/strict';
import { assertEqualPointEpsilon } from './helpers/assert.js';
import {testables as t} from '../src/renderer.js';

const origin = {x: 0, y: 0};

describe('getInitialXIntercept', () => {
    // TODO: what do we do if 90? Special case anyway.
    it('returns correctly for NW', () => {
        const actual = t.getInitialXIntercept({x: 12, y: 12}, 45);
        assertEqualPointEpsilon(actual, {x: 16, y: 8});
    });

    it('returns correctly for SW', () => {
        const actual = t.getInitialXIntercept({x: 12, y: 12}, 135);
        assertEqualPointEpsilon(actual, {x: 16, y: 16});
    });

    it('returns correctly for SE', () => {
        const actual = t.getInitialXIntercept({x: 12, y: 12}, 225);
        assertEqualPointEpsilon(actual, {x: 8, y: 16});
    });

    it('returns correctly for NE', () => {
        const actual = t.getInitialXIntercept({x: 12, y: 12}, 315);
        assertEqualPointEpsilon(actual, {x: 8, y: 8});
    });

    it('returns correctly when given horizontal degree amounts', () => {
        const actualW = t.getInitialXIntercept({x: 12, y: 12}, 90);
        assertEqualPointEpsilon(actualW, {x: 16, y: 12});

        const actualE = t.getInitialXIntercept({x: 12, y: 12}, 270);
        assertEqualPointEpsilon(actualE, {x: 8, y: 12});
    });

    it('throws when given vertical degree amounts', () => {
        const point = {x: 1, y: 2};
        assert.throws(() => t.getInitialXIntercept(point, 0));
        assert.throws(() => t.getInitialXIntercept(point, 180));
    });
});

describe('getInitialYIntercept', () => {
    it('returns correctly for NW', () => {
        const actual = t.getInitialYIntercept({x: 12, y: 12}, 45);
        assertEqualPointEpsilon(actual, {x: 16, y: 8});
    });

    it('returns correctly for SW', () => {
        const actual = t.getInitialYIntercept({x: 12, y: 12}, 135);
        assertEqualPointEpsilon(actual, {x: 16, y: 16});
    });

    it('returns correctly for SE', () => {
        const actual = t.getInitialYIntercept({x: 12, y: 12}, 225);
        assertEqualPointEpsilon(actual, {x: 8, y: 16});
    });

    it('returns correctly for NE', () => {
        const actual = t.getInitialYIntercept({x: 12, y: 12}, 315);
        assertEqualPointEpsilon(actual, {x: 8, y: 8});
    });

    it('returns correctly when given vertical degree amounts', () => {
        const actualW = t.getInitialYIntercept({x: 12, y: 12}, 0);
        assertEqualPointEpsilon(actualW, {x: 12, y: 8});

        const actualE = t.getInitialYIntercept({x: 12, y: 12}, 180);
        assertEqualPointEpsilon(actualE, {x: 12, y: 16});
    });

    it('throws when given horizontal degree amounts', () => {
        const point = {x: 1, y: 2};
        assert.throws(() => t.getInitialYIntercept(point, 90));
        assert.throws(() => t.getInitialYIntercept(point, 270));
    });
});

describe('getXInterceptSteps', () => {
    // These assume wall width = 8.

    it('returns correctly for a point on the 45 degrees', () => {
        let actual = t.getXInterceptSteps(origin, {x: 2, y: 2});
        assert.deepStrictEqual(actual, {xStep: 8, yStep: 8});

        actual = t.getXInterceptSteps({x: 0, y: 2}, {x: 2, y: 0});
        assert.deepStrictEqual(actual, {xStep: 8, yStep: -8});

        actual = t.getXInterceptSteps(origin, {x: 2, y: 4});
        assert.deepStrictEqual(actual, {xStep: 8, yStep: 16});
    });

    it('returns correctly for negative horizontal moves', () => {
        let actual = t.getXInterceptSteps({x: 2, y: 2}, origin);
        assert.deepStrictEqual(actual, {xStep: -8, yStep: -8});
    });
});

describe('getYInterceptSteps', () => {
    // These assume wall width = 8.

    it('returns correctly for a point on the 45 degrees', () => {
        let actual = t.getYInterceptSteps(origin, {x: 2, y: 2});
        assert.deepStrictEqual(actual, {xStep: 8, yStep: 8});

        actual = t.getYInterceptSteps({x: 0, y: 2}, {x: 2, y: 0});
        assert.deepStrictEqual(actual, {xStep: 8, yStep: -8});

        actual = t.getYInterceptSteps(origin, {x: 2, y: 4});
        assert.deepStrictEqual(actual, {xStep: 4, yStep: 8});
    });

    it('returns correctly for negative vertical moves', () => {
        let actual = t.getYInterceptSteps({x: 2, y: 2}, origin);
        assert.deepStrictEqual(actual, {xStep: -8, yStep: -8});
    });
});
