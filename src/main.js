import { RESOLUTION } from "./config.js";
import { renderFrame } from "./renderer.js";

/**
 * @type [CanvasRenderingContext2D]
 */
let canvasContext;
let isRendering = true;

function appendPageBody() {
    const canvasEl = document.createElement('canvas');
    canvasEl.width = RESOLUTION.width;
    canvasEl.height = RESOLUTION.height;
    canvasEl.innerText = 'Canvas unavailable';
    document.body.append(canvasEl);
    document.body.append(document.createElement('br'));

    const stopRenderButton = document.createElement('button');
    stopRenderButton.innerText = 'Stop rendering';
    stopRenderButton.type = 'button';
    stopRenderButton.addEventListener('click', (e) => { isRendering = false; });
    document.body.append(stopRenderButton);
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

function main() {
    appendPageBody();
    const canvas = document.querySelector('canvas');
    canvasContext = canvas.getContext('2d');
    window.requestAnimationFrame(onAnimationFrame);
}

main();
