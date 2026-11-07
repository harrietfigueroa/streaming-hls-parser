// These tests pin utf8ByteLength against Node's own UTF-8 encoder across each
// encoded width, including surrogate pairs and a lone surrogate.
import { describe, expect, test } from "vitest";

import { utf8ByteLength } from "../../src/library/utf8.js";

const encoder = new TextEncoder();

describe("utf8ByteLength", () => {
    const texts = ["", "segment.ts", "café", "€100", "\u{1F3B5} track", "a\uD800b"] as const;

    test.each(texts)("counts the bytes of %j as TextEncoder encodes them", (text) => {
        const encoded = encoder.encode(text);
        expect(utf8ByteLength(text)).toBe(encoded.length);
    });
});
