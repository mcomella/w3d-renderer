import { WALL_TEXTURE_SIZE } from "./config.js";

// Changing the color between x/y intersections changes the lighting, improving
// the perception of perspective.
export const demoLightTexture = generateTexture(0xFF);
export const demoDarkTexture = generateTexture(0xAA);

/**
 * Returns a texture that is Uint8ClampedArray[] where:
 * - texture[i] returns a column of pixels as a UInt8ClampedArray
 * - texture[i][j] returns is a specific RGBA in a pixel
 *
 * It tries to mimic a wall but it *is* programmer art. :)
 *
 * @param {number} solidBlue
 * @returns {Uint8ClampedArray[]}
 */
function generateTexture(solidBlue) {
    const texture = new Array(WALL_TEXTURE_SIZE);

    // Fill solid.
    for (let c = 0; c < texture.length; c++) {
        const column = new Uint8ClampedArray(WALL_TEXTURE_SIZE * 4); // 4 for RGBA
        texture[c] = column;
        for (let p = 0; p < column.length; p += 4) {
            drawColor(column, p, 0x00, 0x00, solidBlue);
        }
    }

    function drawGroutHorizontal(column, pxIndex) {
        drawColor(column, pxIndex - 4, 0xBB, 0xBB, 0xBB);
        drawColor(column, pxIndex, 0xAA, 0xAA, 0xAA);
        drawColor(column, pxIndex + 4, 0xBB, 0xBB, 0xBB);
    }

    // Add horizontal lines all the way across.
    for (let c = 0; c < texture.length; c++) {
        const column = texture[c];
        drawGroutHorizontal(column, 16 * 4);
        drawGroutHorizontal(column, 32 * 4);
        drawGroutHorizontal(column, 48 * 4);
    }

    function drawGroutVertical(texture, colIndex, pxIndex) {
        drawColor(texture[colIndex], pxIndex, 0xAA, 0xAA, 0xAA);
    }

    // Add vertical lines at odd intervals.
    for (let p = 0; p < 16 * 4; p += 4) {
        drawGroutVertical(texture, 0, p);
        drawGroutVertical(texture, 16, p);
        drawGroutVertical(texture, 32, p);
        drawGroutVertical(texture, 48, p);
    }
    for (let p = 16 * 4; p < 32 * 4; p += 4) {
        drawGroutVertical(texture, 8, p);
        drawGroutVertical(texture, 20, p);
        drawGroutVertical(texture, 28, p);
        drawGroutVertical(texture, 44, p);
        drawGroutVertical(texture, 52, p);
    }
    for (let p = 32 * 4; p < 48 * 4; p += 4) {
        drawGroutVertical(texture, 0, p);
        drawGroutVertical(texture, 16, p);
        drawGroutVertical(texture, 34, p);
        drawGroutVertical(texture, 56, p);
    }
    for (let p = 48 * 4; p < 64 * 4; p += 4) {
        drawGroutVertical(texture, 20, p);
        drawGroutVertical(texture, 44, p);
    }

    return texture;
}

function drawColor(arr, i, r, g, b) {
    arr[i] = r;
    arr[i + 1] = g;
    arr[i + 2] = b;
    arr[i + 3] = 0xFF;
}
