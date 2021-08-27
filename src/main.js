import { demoMap } from "./demoAssets.js";
import { BLOCK_SIZE, RESOLUTION } from "./config.js";
import { onKey, nextInputState } from "./input.js";
import { renderFrame } from "./renderer.js";
import { updateWorld } from "./world.js";

/** @type {CanvasRenderingContext2D} */
let canvasContext;
let isRendering = true;

/** @type {import("./world").WorldState} */
let worldState = {
    playerLoc: {x: demoMap.playerStartingLoc.x * BLOCK_SIZE + BLOCK_SIZE / 2, // center in space.
            y: demoMap.playerStartingLoc.y * BLOCK_SIZE + BLOCK_SIZE / 2},
    playerAngle: demoMap.playerStartingTheta,
};

function configureBody() {
    const canvasEl = document.querySelector('canvas');
    canvasEl.width = RESOLUTION.width;
    canvasEl.height = RESOLUTION.height;

    const stopRenderButton = document.querySelector('button');
    stopRenderButton.addEventListener('click', () => {
        isRendering = false;
        stopRenderButton.disabled = true;
    });

    // Adding key events to body seems more natural than making canvas focusable.
    const body = document.body;
    body.addEventListener('keydown', (e) => { onKey(e.code, /* isDown */ true); });
    body.addEventListener('keyup', (e) => { onKey(e.code, /* isDown */ false); });
}

/**
 * @param {DOMHighResTimeStamp} time
 */
function onAnimationFrame(time) {
    // TODO: delta based on time passed
    worldState = updateWorld(time, worldState, nextInputState);
    renderFrame(canvasContext, RESOLUTION, worldState.playerLoc, worldState.playerAngle);
    if (isRendering) {
        window.requestAnimationFrame(onAnimationFrame);
    }
}

function main() {
    configureBody();
    canvasContext = document.querySelector('canvas').getContext('2d');
    window.requestAnimationFrame(onAnimationFrame); // start render loop.
}

main();
