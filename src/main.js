import { demoMap } from "./demoAssets.js";
import { BLOCK_SIZE, RESOLUTION } from "./config.js";
import { onKey, nextInputState } from "./input.js";
import { renderFrame } from "./renderer.js";
import { updateWorld } from "./world.js";
import * as w3dAssets from "./w3dAssets.js";
import { assert } from "./util.js";

/** @type {CanvasRenderingContext2D} */
let canvasContext;
let isRendering = true;

/** @type {import("./world").WorldState} */
// let worldState = {
//     playerLoc: {x: demoMap.playerStartingLoc.x * BLOCK_SIZE + BLOCK_SIZE / 2, // center in space.
//             y: demoMap.playerStartingLoc.y * BLOCK_SIZE + BLOCK_SIZE / 2},
//     playerAngle: demoMap.playerStartingTheta,
// };
let worldState = {
    playerLoc: {x: 10, y: 10},
    playerAngle: 0,
};

let textures;
let maps;
let debugMap;

function drawDebugMap() {
    let outputStr = '';
    for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 64; j++) {
            const tile = maps[0].plane0[i * 64 + j];
            if (tile <= 63) {
                outputStr += 'x';
            } else {
                outputStr += ' ';
            }
        }
        outputStr += '\n';
    }
    console.log(outputStr);
}

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
    renderFrame(canvasContext, RESOLUTION, worldState.playerLoc, worldState.playerAngle, maps, textures);
    if (isRendering) {
        window.requestAnimationFrame(onAnimationFrame);
    }
}

function requestAssetsFromServerAndStartLoop() {
    function fetchAsset(path, onResponse) {
        // via https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
        const req = new XMLHttpRequest();
        req.open('GET', path, true);
        req.responseType = 'arraybuffer';
        req.onload = (e) => onResponse(req.response);
        req.send(null);
    }

    // I should probably unnest these and handle cascading errors.
    fetchAsset('w3d-assets/MAPHEAD.WL1', (response) => {
        const maphead = w3dAssets.loadMaphead(response);

        fetchAsset('w3d-assets/GAMEMAPS.WL1', (response) => {
            maps = w3dAssets.loadGamemaps(response, maphead);

            debugMap = [];
            for (let i = 0; i < 64; i++) {
                debugMap.push(maps[0].plane0.slice(i * 64, i * 64 + 64));
            }
            drawDebugMap();

            const playerCoord = Array.from(maps[0].plane1).findIndex((e) => e >= 19 && e <= 22);
            assert(playerCoord >= 0);
            const playerX = playerCoord % 64;
            const playerY = Math.floor(playerCoord / 64);
            worldState.playerLoc = {x: playerX * 8, y: playerY * 8};
            console.log('playerLoc: ');
            console.log(worldState.playerLoc)

            fetchAsset('/w3d-assets/VSWAP.WL1', (response) => {
                const vswap = w3dAssets.loadVSwap(response);
                textures = vswap.textures;

                // TODO: do this whether request succeeds or fails
                window.requestAnimationFrame(onAnimationFrame); // start render loop.

                // TODO: extract me to texture explorer
                const newCanvas = document.createElement('canvas');
                document.body.appendChild(newCanvas);
                newCanvas.width = 64;
                newCanvas.height = 64;
                const ctx = newCanvas.getContext('2d');

                function writeTextureToCanvas(ctx, texture) {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, 64, 64);

                    const imageData = ctx.getImageData(0, 0, 64, 64);
                    const data = imageData.data;
                    for (let i = 0; i < texture.length; i++) {
                        data[i] = texture[i];
                    }

                    ctx.putImageData(imageData, 0, 0);
                }

                writeTextureToCanvas(ctx, vswap.textures[0]);
            });
        });
    });
}

function main() {
    configureBody();
    canvasContext = document.querySelector('canvas').getContext('2d');
    requestAssetsFromServerAndStartLoop();
}

main();
