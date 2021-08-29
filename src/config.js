/**
 * @typedef {Object} Resolution
 * @property {number} width
 * @property {number} height
 */
export const RESOLUTION = {
    width: 640,
    height: 400,
};

/**
 * Testing IRL, if my eyes are 5' and the walls are 10', the wall fills my field of view at ~8' away.
 * Formula: h = X / d. IRL: 10 = X / 8. X = 80.
 * In game, if walls are 8' tall then 8 = 80 / d. d = 10. I must be ~10' away to fill the field of view.
 * At 10ft away, the height should be resolution.height. resolution.height = X / 10. X = resolution.height * 10.
 */
export const WALL_HEIGHT_SCALE_FACTOR = RESOLUTION.height * 2; // Note: formerly 2000.

/**
 * The size of both dimensions of the walls (they're placed as blocks).
 */
export const BLOCK_SIZE = 8 // ft

export const WALL_TEXTURE_SIZE_PX = 64; // w3d texture size
export const WALL_TEXTURE_SIZE_BYTES = WALL_TEXTURE_SIZE_PX * 4; // stored in RGBA array.
