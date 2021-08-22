import * as rcMath from "./rcMath.js";

const VELOCITY_CONSTANT = 1; // ft per frame
const ROTATION_CONSTANT = 2; // degree per frame

/**
 * @typedef {Object} WorldState
 * @property {import("./rcMath").Point} playerLoc
 * @property {number} playerAngle
 *
 * @param {DOMHighResTimeStamp} time
 * @param {WorldState} state
 * @param {import("./input").InputState} nextInputState
 * @returns {WorldState}
 */
export function updateWorld(time, state, nextInputState) {
    let hypotModifier = 0;
    if (nextInputState.moveForward) hypotModifier -= 1; // for signs, assume angle = 0.
    if (nextInputState.moveBackward) hypotModifier += 1;
    const hypotVelocity = VELOCITY_CONSTANT * hypotModifier;

    let rotationModifier = 0;
    if (nextInputState.turnLeft) rotationModifier -= 1;
    if (nextInputState.turnRight) rotationModifier += 1;
    const newPlayerAngle = rcMath.adjustAngleTo360(state.playerAngle + ROTATION_CONSTANT * rotationModifier);

    const newPlayerLoc = {
        x: state.playerLoc.x - hypotVelocity * rcMath.sinDeg(newPlayerAngle), // ... + HsinΘ
        y: state.playerLoc.y + hypotVelocity * rcMath.cosDeg(newPlayerAngle), // ... + HcosΘ
    };
    return {
        playerLoc: newPlayerLoc,
        playerAngle: newPlayerAngle,
    };
}
