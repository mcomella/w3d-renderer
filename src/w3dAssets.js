import { assert } from "./util.js";
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

// via https://vpoupet.github.io/wolfenstein/docs/files.html
export function loadMaphead(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    return {
        rlewTag: view.getUint16(0, true),
        gamemapsOffsets: new Uint32Array(arrayBuffer.slice(2)),
    };
}

// via https://vpoupet.github.io/wolfenstein/docs/files.html
export function loadGamemaps(arrayBuffer, maphead) {
    function getHeader(offset) {
        // Offset is 0 if the map does not exist.
        if (!offset) {
            return null;
        }

        const view = new DataView(arrayBuffer, offset, 38);
        const header = {
            offsetPlane0: view.getUint32(0, true),
            offsetPlane1: view.getUint32(4, true),
            offsetPlane2: view.getUint32(8, true),
            sizeCompressedPlane0: view.getUint16(12, true),
            sizeCompressedPlane1: view.getUint16(14, true),
            sizeCompressedPlane2: view.getUint16(16, true),
            width: view.getUint16(18, true),
            height: view.getUint16(20, true),
            name: arrayBufferNullTerminatedToString(arrayBuffer.slice(offset + 22, offset + 22 + 16)),
        }

        assert(header.width === 64, () => `Unexpected map width. Got: ${header.width}`);
        assert(header.height === 64, () => `Unexpected map height. Got: ${header.height}`);
        return header;
    }

    function decompressMap(header) {
        return {
            plane0: decompressPlane(header.offsetPlane0, header.sizeCompressedPlane0),
            plane1: decompressPlane(header.offsetPlane1, header.sizeCompressedPlane1),
            // Supposedly plane 2 is unused so we ignore it here.
            width: header.width,
            height: header.height,
            name: header.name,
        };
    }

    function decompressPlane(offset, sizeCompressed) {
        const planeCompressed = arrayBuffer.slice(offset, offset + sizeCompressed);
        const planeArrayBuffer = decodeRlew(maphead.rlewTag, decodeCarmack(planeCompressed));
        const planeArr = new Uint8Array(planeArrayBuffer);
        assert(planeArr.length === 64 * 64 * 2 /* byte len */, () => `got len ${planeArr.length}`);
        return planeArr;
    }

    const headerOffsets = maphead.gamemapsOffsets;
    const headers = Array.from(headerOffsets).map(getHeader).filter((h) => h); // filter out non-existent maps.
    return headers.map(decompressMap);
}

// via https://vpoupet.github.io/wolfenstein/docs/files.html
function decodeRlew(rlewTag, arrayBuffer) {
    const decodedData = [];
    const decodedDataBytesLen = new DataView(arrayBuffer, 0, 2).getUint16(0, true);

    const data = new Uint16Array(arrayBuffer);
    let offset = 1;
    while (offset < data.length) {
        const maybeTag = data[offset];
        if (maybeTag !== rlewTag) {
            decodedData.push(maybeTag);
            offset += 1;
        } else {
            const repeatCount = data[offset + 1];
            const repeatedWord = data[offset + 2];
            decodedData.push(...Array(repeatCount).fill(repeatedWord));
            offset += 3;
        }
    }

    assert(decodedData.length * 2 === decodedDataBytesLen,
            () => `expected decoded data len ${decodedDataBytesLen}, got ${decodedData.length * 2}`);

    // We convert back into an ArrayBuffer so the next algo can use whichever typed arrays it needs.
    // We don't add the data to an ArrayBuffer initially because it's easier to append to an Array.
    return wordArrayToArrayBuffer(decodedData);
}

/**
 * via https://vpoupet.github.io/wolfenstein/docs/files.html
 * @param {ArrayBuffer} data
 */
function decodeCarmack(arrayBuffer) {
    const decodedData = [];
    const decodedDataBytesLen = new DataView(arrayBuffer, 0, 2).getUint16(0, true);

    const data = new Uint8Array(arrayBuffer);
    let offset = 2;
    while (offset < data.length) {
        const numWordsToAppend = data[offset];
        const pointerIndicator = data[offset + 1];

        if ((pointerIndicator === 0xA7 || pointerIndicator === 0xA8) && numWordsToAppend === 0) { // special case
            const extraByte = data[offset + 2];
            decodedData.push(extraByte, pointerIndicator);
            offset += 3;

        } else if (pointerIndicator === 0xA7) { // near pointer algo
            const backwardsOffsetBytes = data[offset + 2] * 2; // 2x because words -> bytes.
            const appendWordOffsetStart = decodedData.length - backwardsOffsetBytes;
            const appendWordOffsetEnd = appendWordOffsetStart + numWordsToAppend * 2;
            assert(appendWordOffsetEnd <= decodedData.length,
                    () => `append ${appendWordOffsetEnd} exceeds data length ${decodedData.length}`);
            decodedData.push(...decodedData.slice(appendWordOffsetStart, appendWordOffsetEnd));
            offset += 3;

        } else if (pointerIndicator === 0xA8) { // far pointer algo
            const absoluteOffsetStartWords = data[offset + 2] + (data[offset + 3] << 8); // read a word.
            const absoluteOffsetStartBytes = absoluteOffsetStartWords * 2;
            const absoluteOffsetEnd = absoluteOffsetStartBytes + numWordsToAppend * 2;
            assert(absoluteOffsetEnd <= decodedData.length,
                    () => `append ${absoluteOffsetEnd} exceeds data length ${decodedData.length}`);
            decodedData.push(...decodedData.slice(absoluteOffsetStartBytes, absoluteOffsetEnd));
            offset += 4;

        } else { // default case: no compression.
            decodedData.push(numWordsToAppend, pointerIndicator);
            offset += 2;
        }
    }

    assert(decodedData.length === decodedDataBytesLen,
            () => `expected decoded data len ${decodedDataBytesLen}, got ${decodedData.length}`);

    // We convert back into an ArrayBuffer so the next algo can use whichever typed arrays it needs.
    // We don't add the data to an ArrayBuffer initially because it's easier to append to an Array.
    return byteArrayToArrayBuffer(decodedData);
}

function byteArrayToArrayBuffer(byteArray) {
    const output = new ArrayBuffer(byteArray.length);
    const outputView = new Uint8Array(output);
    byteArray.forEach((byte, i) => outputView[i] = byte);
    return output;
}

function wordArrayToArrayBuffer(wordArray) {
    const output = new ArrayBuffer(wordArray.length * 2);
    const outputView = new Uint8Array(output);
    wordArray.forEach((word, i) => {
        outputView[i * 2] = word & 0xFF;
        outputView[i * 2 + 1] = word >> 8;
    });
    return output;
}

// via https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function arrayBufferNullTerminatedToString(buffer) {
    const strWithNullTermination = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return strWithNullTermination.substring(0, strWithNullTermination.indexOf('\0'));
}
