import * as rcMath from "./rcMath.js";

/**
 * @param {DOMHighResTimeStamp} time
 * @param {Point} playerLoc
 * @param {number} playerAngle
 * @param {import("./input").InputState} nextInputState
 */
export function updateWorld(time, playerLoc, playerAngle, nextInputState) {
    let zModifier = 0;
    if (nextInputState.moveForward) zModifier -= 1;
    if (nextInputState.moveBackward) zModifier += 1;
    const zVelocity = 1 /* constant */ * zModifier;

    let rotationModifier = 0;
    if (nextInputState.turnLeft) rotationModifier -= 1;
    if (nextInputState.turnRight) rotationModifier += 1;
    const newPlayerAngle = playerAngle + 1 /* constant */ * rotationModifier;

    const newPlayerLoc = {
        x: playerLoc.x + zVelocity * rcMath.sinDeg(newPlayerAngle), // ... + HsinΘ
        y: playerLoc.y + zVelocity * rcMath.cosDeg(newPlayerAngle), // ... + HcosΘ
    };
    return {
        playerLoc: newPlayerLoc,
        playerAngle: newPlayerAngle,
    };
}
