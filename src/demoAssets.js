import { WALL_TEXTURE_SIZE_BYTES, WALL_TEXTURE_SIZE_PX } from "./config.js";
import { assert } from "./util.js";

export const demoMap = generateMap();

// Changing the color between x/y intersections changes the lighting, improving
// the perception of perspective.
export const demoLightTexture = generateTexture(0xFF);
export const demoDarkTexture = generateTexture(0xAA);

/**
 * Returns a texture that is a 1D Uint8ClampedArray where unconventionally
 * column 0 is represented in index 0-texture_size_px (like w3d textures).
 *
 * It tries to mimic a wall but it *is* programmer art. :)
 *
 * @param {number} solidBlue
 * @returns {Uint8ClampedArray}
 */
function generateTexture(solidBlue) {
    const texture = new Uint8ClampedArray(WALL_TEXTURE_SIZE_BYTES * WALL_TEXTURE_SIZE_BYTES);

    // Fill solid.
    for (let i = 0; i < texture.length; i += 4) {
        drawColor(texture, i, 0x00, 0x00, solidBlue);
    }

    function drawGroutHorizontal(arr, pxIndex) {
        drawColor(arr, pxIndex - 4, 0xBB, 0xBB, 0xBB);
        drawColor(arr, pxIndex, 0xAA, 0xAA, 0xAA);
        drawColor(arr, pxIndex + 4, 0xBB, 0xBB, 0xBB);
    }

    // Add horizontal lines all the way across.
    for (let columnNum = 0; columnNum < WALL_TEXTURE_SIZE_PX; columnNum++) {
        drawGroutHorizontal(texture, 16 * 4 + columnNum * WALL_TEXTURE_SIZE_BYTES);
        drawGroutHorizontal(texture, 32 * 4 + columnNum * WALL_TEXTURE_SIZE_BYTES);
        drawGroutHorizontal(texture, 48 * 4 + columnNum * WALL_TEXTURE_SIZE_BYTES);
    }

    function drawGroutVertical(texture, columnNum, pxIndex) {
        const index = columnNum * WALL_TEXTURE_SIZE_BYTES + pxIndex;
        drawColor(texture, index, 0xAA, 0xAA, 0xAA);
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

/**
 * Returns a map where map[i] returns a row. In each value:
 * - 'w' = wall
 * - '' = empty space
 */
function generateMap() {
    const mapStr = `
wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
w                         wp  w                                w
w                         ww ww                                w
w                         w   w                                w
w                         ww ww                                w
w                         w   w                                w
w                     wwwwww wwwwww                            w
w                     w           w                            w
w                     w                                        w
w                     w           w                            w
w                     wwwwwwwwwwwww                            w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
w                                                              w
wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww`;

    const tiles = mapStr.split('\n').slice(1) // slice to remove empty first row.
    assert(tiles.length === 64, () => `unexpected map length ${tiles.length}`);

    let playerStartingLoc;
    for (let i = 0; i < tiles.length; i++) {
        tiles[i] = tiles[i].split('');
        assert(tiles[i].length === 64, () => `unexpected row length ${tiles[i].length}`);

        for (let j = 0; j < tiles[i].length; j++) {
            if (tiles[i][j] === 'p') {
                playerStartingLoc = {x: j, y: i};
            }
        }
    }

    assert(playerStartingLoc, 'player starting location should be set');
    return {
        tiles: tiles,
        playerStartingLoc: playerStartingLoc,
        playerStartingTheta: 90,
    }
}
