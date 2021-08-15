/**
 * @typedef {Object} InputState
 * @property {boolean} moveForward
 * @property {boolean} moveBackward
 * @property {boolean} turnLeft
 * @property {boolean} turnRight
 */
export const nextInputState = {
    moveForward: false,
    moveBackward: false,
    turnLeft: false,
    turnRight: false,
};

/**
 * @param {string} eventCode key.code. We intentionally use the physical key position to
 * support alternative keyboard layouts withou having to switch
 * @param {boolean} isDown
 */
export function onKey(eventCode, isDown) {
    if (eventCode === "KeyW" || eventCode === "ArrowUp") {
        nextInputState.moveForward = isDown;
    } else if (eventCode === "KeyS" || eventCode === "ArrowDown") {
        nextInputState.moveBackward = isDown;
    } else if (eventCode === "KeyA" || eventCode === "ArrowLeft") {
        nextInputState.turnLeft = isDown;
    } else if (eventCode === "KeyD" || eventCode === "ArrowRight") {
        nextInputState.turnRight = isDown;
    }
}
