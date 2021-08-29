import { demoMap } from "./demoAssets.js";
import { BLOCK_SIZE, RESOLUTION } from "./config.js";
import { onKey, nextInputState } from "./input.js";
import { renderFrame } from "./renderer.js";
import { updateWorld } from "./world.js";
import * as w3dAssets from "./w3dAssets.js";

/** @type {CanvasRenderingContext2D} */
let canvasContext;
let isRendering = true;

/** @type {import("./world").WorldState} */
let worldState = {
    playerLoc: {x: demoMap.playerStartingLoc.x * BLOCK_SIZE + BLOCK_SIZE / 2, // center in space.
            y: demoMap.playerStartingLoc.y * BLOCK_SIZE + BLOCK_SIZE / 2},
    playerAngle: demoMap.playerStartingTheta,
};

let textures;

function configureBody() {
    const canvasEl = document.querySelector('canvas');
    canvasEl.width = RESOLUTION.width;
    canvasEl.height = RESOLUTION.height;

    const stopRenderButton = document.querySelector('button');
    stopRenderButton.addEventListener('click', () => {
        isRendering = false;
        stopRenderButton.disabled = true;
    });

    const uploadButton = document.querySelector('#upload');
    uploadButton.addEventListener('change', () => {
        console.log(uploadButton.files)
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log(e.target.result);
        };
        reader.readAsArrayBuffer(uploadButton.files[0]);
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
    renderFrame(canvasContext, RESOLUTION, worldState.playerLoc, worldState.playerAngle, textures);
    if (isRendering) {
        window.requestAnimationFrame(onAnimationFrame);
    }
}

function requestAssetsFromServer() {
    function fetchAsset(path, onResponse) {
        // via https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
        const req = new XMLHttpRequest();
        req.open('GET', path, true);
        req.responseType = 'arraybuffer';
        req.onload = (e) => onResponse(req.response);
        req.send(null);
    }

    fetchAsset('/w3d-assets/VSWAP.WL1', (response) => {
        const vswap = w3dAssets.loadVSwap(response);
        textures = vswap.textures;
        window.requestAnimationFrame(onAnimationFrame); // start render loop.
    });
}

function main() {
    configureBody();
    canvasContext = document.querySelector('canvas').getContext('2d');
    requestAssetsFromServer();
}

main();
