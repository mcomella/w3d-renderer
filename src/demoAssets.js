import { WALL_TEXTURE_SIZE } from "./config.js";

// Changing the color between x/y intersections changes the lighting, improving
// the perception of perspective.
export const lightWallTexture = generateTexture(0xFF);
export const darkWallTexture = generateTexture(0xAA);

/**
 * Returns a texture that is Uint8ClampedArray[] where:
 * - texture[i] returns a column of pixels as a UInt8ClampedArray
 * - texture[i][j] returns is a specific RGBA in a pixel
 *
 * @param {number} solidBlue
 * @returns {Uint8ClampedArray[]}
 */
function generateTexture(solidBlue) {
    const texture = new Array(WALL_TEXTURE_SIZE);

    // Fill solid.
    for (let i = 0; i < texture.length; i++) {
        const column = new Uint8ClampedArray(WALL_TEXTURE_SIZE * 4); // 4 for RGBA
        texture[i] = column;
        for (let j = 0; j < column.length; j += 4) {
            drawColor(column, j, 0x00, 0x00, solidBlue);
        }
    }

    function drawGroutHorizontal(column, i) {
        drawColor(column, i - 4, 0xBB, 0xBB, 0xBB);
        drawColor(column, i, 0xAA, 0xAA, 0xAA);
        drawColor(column, i + 4, 0xBB, 0xBB, 0xBB);
    }

    // Add horizontal lines.
    for (let i = 0; i < texture.length; i++) {
        const column = texture[i];
        drawGroutHorizontal(column, 16 * 4);
        drawGroutHorizontal(column, 32 * 4);
        drawGroutHorizontal(column, 48 * 4);
    }

    return texture[0];
}

function drawColor(arr, i, r, g, b) {
    arr[i] = r;
    arr[i + 1] = g;
    arr[i + 2] = b;
    arr[i + 3] = 0xFF;
}
