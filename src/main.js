import { RESOLUTION } from "./config.js";
import { onKey, nextInputState } from "./input.js";
import { renderFrame } from "./renderer.js";
import { updateWorld } from "./world.js";

/**
 * @type [CanvasRenderingContext2D]
 */
let canvasContext;
let isRendering = true;

function configureBody() {
    const canvasEl = document.querySelector('canvas');
    canvasEl.width = RESOLUTION.width;
    canvasEl.height = RESOLUTION.height;

    const stopRenderButton = document.querySelector('button');
    stopRenderButton.addEventListener('click', (e) => {
        isRendering = false;
        stopRenderButton.disabled = true;
    });

    // Adding key events to body seems more natural than making canvas focusable.
    const body = document.body;
    body.addEventListener('keydown', (e) => { onKey(e.code, /* isDown */ true); });
    body.addEventListener('keyup', (e) => { onKey(e.code, /* isDown */ false); });
}

let playerLoc = { x: 15, y: 33 };
let playerAngle = 180;

/**
 * @param {DOMHighResTimeStamp} time
 */
function onAnimationFrame(time) {
    // TODO: delta based on time passed
    const nextState = updateWorld(time, playerLoc, playerAngle, nextInputState);
    playerLoc = nextState.playerLoc;
    playerAngle = nextState.playerAngle;

    renderFrame(canvasContext, RESOLUTION, playerLoc, playerAngle);
    if (isRendering) {
        window.requestAnimationFrame(onAnimationFrame);
    }
}

function main() {
    configureBody();
    canvasContext = document.querySelector('canvas').getContext('2d');
    window.requestAnimationFrame(onAnimationFrame);
}

main();
