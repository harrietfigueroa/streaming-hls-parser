// UTF-8 byte counting over UTF-16 strings. This module is pure.
const ONE_BYTE_LAST = 0x7f;
const TWO_BYTE_LAST = 0x7ff;
const HIGH_SURROGATE_FIRST = 0xd800;
const HIGH_SURROGATE_LAST = 0xdbff;
const LOW_SURROGATE_FIRST = 0xdc00;
const LOW_SURROGATE_LAST = 0xdfff;
const TWO_BYTES = 2;
const THREE_BYTES = 3;
const FOUR_BYTES = 4;
// A UTF-16 code unit encodes to at most 3 UTF-8 bytes: a surrogate pair's two encode to 4, and a
// lone surrogate to U+FFFD's 3.
const UTF8_BYTES_PER_CODE_UNIT_MAX = 3;

function isHighSurrogate(code: number) {
    return code >= HIGH_SURROGATE_FIRST && code <= HIGH_SURROGATE_LAST;
}

function isLowSurrogate(code: number) {
    return code >= LOW_SURROGATE_FIRST && code <= LOW_SURROGATE_LAST;
}

/** Counts the bytes `text` encodes to in UTF-8, a lone surrogate counting as the 3-byte U+FFFD that replaces it. */
export function utf8ByteLength(text: string) {
    let byteCount = 0;
    for (let index = 0; index < text.length; index += 1) {
        const code = text.charCodeAt(index);
        if (code <= ONE_BYTE_LAST) {
            byteCount += 1;
            continue;
        }
        if (code <= TWO_BYTE_LAST) {
            byteCount += TWO_BYTES;
            continue;
        }
        const nextCode = text.charCodeAt(index + 1);
        const isSurrogatePair = isHighSurrogate(code) && isLowSurrogate(nextCode);
        if (isSurrogatePair) {
            byteCount += FOUR_BYTES;
            index += 1;
            continue;
        }
        byteCount += THREE_BYTES;
    }
    return byteCount;
}

/** Whether `text` encodes to at most `bytesMax` UTF-8 bytes, counting them only when its length allows more. */
export function isWithinUtf8Bytes(text: string, bytesMax: number) {
    const bytesBound = text.length * UTF8_BYTES_PER_CODE_UNIT_MAX;
    if (bytesBound <= bytesMax) {
        return true;
    }
    const byteCount = utf8ByteLength(text);
    return byteCount <= bytesMax;
}
