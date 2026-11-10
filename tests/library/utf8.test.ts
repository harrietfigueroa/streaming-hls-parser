// These tests pin utf8ByteLength against Node's own UTF-8 encoder across each
// encoded width, including surrogate pairs and a lone surrogate, and
// isWithinUtf8Bytes at each side of its bound.
import { describe, expect, test } from "vitest";

import { isWithinUtf8Bytes, utf8ByteLength } from "../../src/library/utf8.js";

const encoder = new TextEncoder();
const HIGH_SURROGATE_FIRST = 0xd800;
const LONE_HIGH_SURROGATE = String.fromCharCode(HIGH_SURROGATE_FIRST);
const MUSICAL_NOTE = "🎵";

describe("utf8ByteLength", () => {
    const texts = ["", "segment.ts", "café", "€100", "\u{1F3B5} track", "a\uD800b"] as const;

    test.each(texts)("counts the bytes of %j as TextEncoder encodes them", (text) => {
        const encoded = encoder.encode(text);
        expect(utf8ByteLength(text)).toBe(encoded.length);
    });
});

describe("isWithinUtf8Bytes", () => {
    const cases = [
        { name: "an empty text at a bound of 0", text: "", bytesMax: 0, isWithin: true },
        { name: "ASCII at its length", text: "abc", bytesMax: 3, isWithin: true },
        { name: "ASCII one past", text: "abcd", bytesMax: 3, isWithin: false },
        { name: "a 2-byte character at its bytes", text: "café", bytesMax: 5, isWithin: true },
        { name: "a 2-byte character one past", text: "café", bytesMax: 4, isWithin: false },
        { name: "3-byte characters at their bytes", text: "€€", bytesMax: 6, isWithin: true },
        { name: "3-byte characters one past", text: "€€", bytesMax: 5, isWithin: false },
        { name: "a surrogate pair at its 4 bytes", text: MUSICAL_NOTE, bytesMax: 4, isWithin: true },
        { name: "a surrogate pair one past", text: MUSICAL_NOTE, bytesMax: 3, isWithin: false },
        { name: "a lone surrogate at U+FFFD's 3 bytes", text: `a${LONE_HIGH_SURROGATE}`, bytesMax: 4, isWithin: true },
        { name: "a lone surrogate one past", text: `a${LONE_HIGH_SURROGATE}`, bytesMax: 3, isWithin: false },
    ] as const;

    test.each(cases)("reports $name as $isWithin", ({ text, bytesMax, isWithin }) => {
        expect(isWithinUtf8Bytes(text, bytesMax)).toBe(isWithin);
    });
});
