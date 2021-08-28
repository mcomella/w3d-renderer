import { palette } from "./w3dPalette.js";

/**
 * Loads content from the VSWAP.WL* file, which contains textures, sprites, and sounds. This
 * function was written with a lot of help from:
 * - https://devinsmith.net/backups/bruce/wolf3d.html
 * - https://vpoupet.github.io/wolfenstein/docs/files.html
 */
export function loadVSwap(vswapArrayBuffer) {
    function getTableView(offset, len) {
        return vswapArrayBuffer.slice(offset, offset + len);
    }

    // Header table: describes the layout of the file. The file has 3 initial tables then
    // the texture table, which starts at the first offset pointed to be the offset table,
    // followed by the sprite and sound tables.
    const headerLen = 6;
    const header = new DataView(vswapArrayBuffer, 0, headerLen);
    const numAssetsInFile = header.getUint16(0, true);
    const spriteTableOffset = header.getUint16(2, true); // These offsets are in asset counts.
    const soundTableOffset = header.getUint16(4, true);

    // Offset table: pointer offset to each asset in the file. There is one entry per asset.
    const offsetTableOffset = headerLen;
    const offsetTableLen = numAssetsInFile * Uint32Array.BYTES_PER_ELEMENT;
    const offsets = new Uint32Array(getTableView(offsetTableOffset, offsetTableLen));

    // Length table: the length of each asset in the file. It is indexed aligned
    // with the offset table.
    const lengthTableOffset = offsetTableOffset + offsetTableLen;
    const lengthTableLen = numAssetsInFile * Uint16Array.BYTES_PER_ELEMENT;
    const lengths = new Uint16Array(getTableView(lengthTableOffset, lengthTableLen));

    // Texture table: a collection of textures that lasts until the sprite table starts.
    const textures = [];
    for (let i = 0; i < spriteTableOffset; i++) {
        const paletteIndexedTexture = new Uint8Array(getTableView(offsets[i], lengths[i]));
        const rgbaTexture = convertPaletteIndexedTextureToRGBA(paletteIndexedTexture);
        textures.push(rgbaTexture);
    }

    return {textures: textures};
}

/**
 * The original vswap.wl* textures are stored with each entry indexing into a palette where
 * the palette defines the actual color: for convenience, this function converts the
 * palette-indexed texture into a more convenient RGBA format.
 */
function convertPaletteIndexedTextureToRGBA(paletteIndexedTexture) {
    const rgbaTexture = new Uint8ClampedArray(paletteIndexedTexture.length * 4);
    for (let i = 0; i < rgbaTexture.length; i += 4) {
        const pxPaletteIndex = paletteIndexedTexture[i / 4];
        const rgb = palette[pxPaletteIndex];
        rgbaTexture[i] = rgb.r;
        rgbaTexture[i + 1] = rgb.g;
        rgbaTexture[i + 2] = rgb.b;
        rgbaTexture[i + 3] = 0xFF;
    }
    return rgbaTexture;
}
