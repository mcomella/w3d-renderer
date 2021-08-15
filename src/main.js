import { RESOLUTION } from "./config.js";
import { renderFrame } from "./renderer.js";

/**
 * @type [CanvasRenderingContext2D]
 */
let canvasContext;
let isRendering = true;

function configureBody() {
    const canvasEl = document.querySelector('canvas');
    canvasEl.width = RESOLUTION.width;
    canvasEl.height = RESOLUTION.height;
    // canvasEl.addEventListener('keydown', (e) => {
    // });
    // canvasEl.addEventListener('keyup', (e) => {
    // });

    document.querySelector('button').addEventListener('click', (e) => {
        isRendering = false;
    });
}

/**
 * @param {DOMHighResTimeStamp} time
 */
function onAnimationFrame(time) {
    // TODO: delta based on time passed
    renderFrame(canvasContext, RESOLUTION);
    if (isRendering) {
        window.requestAnimationFrame(onAnimationFrame);
    }
}

/**
 *
 * @param {DOMHighResTimeStamp} time
 */
function updateWorld(time) {

}

function main() {
    configureBody();
    canvasContext = document.querySelector('canvas').getContext('2d');
    window.requestAnimationFrame(onAnimationFrame);
}

main();
