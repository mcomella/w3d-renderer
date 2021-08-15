import * as rcMath from "./rcMath.js";

const VELOCITY_CONSTANT = 1; // ft per frame
const ROTATION_CONSTANT = 1; // degree per frame

/**
 * @param {DOMHighResTimeStamp} time
 * @param {Point} playerLoc
 * @param {number} playerAngle
 * @param {import("./input").InputState} nextInputState
 */
export function updateWorld(time, playerLoc, playerAngle, nextInputState) {
    let hypotModifier = 0;
    if (nextInputState.moveForward) hypotModifier -= 1; // for signs, assume angle = 0.
    if (nextInputState.moveBackward) hypotModifier += 1;
    const hypotVelocity = VELOCITY_CONSTANT * hypotModifier;

    let rotationModifier = 0;
    if (nextInputState.turnLeft) rotationModifier -= 1;
    if (nextInputState.turnRight) rotationModifier += 1;
    const newPlayerAngle = rcMath.adjustAngleTo360(playerAngle + ROTATION_CONSTANT * rotationModifier);

    const newPlayerLoc = {
        x: playerLoc.x - hypotVelocity * rcMath.sinDeg(newPlayerAngle), // ... + HsinΘ
        y: playerLoc.y + hypotVelocity * rcMath.cosDeg(newPlayerAngle), // ... + HcosΘ
    };
    return {
        playerLoc: newPlayerLoc,
        playerAngle: newPlayerAngle,
    };
}
