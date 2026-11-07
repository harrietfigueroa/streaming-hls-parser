// These tests pin section 4.4.5.3: EXT-X-PRELOAD-HINT requires a TYPE of PART
// or MAP and a URI.
import { describe, expect, test } from "vitest";

import { extXPreloadHintSchema, PreloadHintType } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.3-ext-x-preload-hint.js";

describe("extXPreloadHintSchema", () => {
    test("converts every attribute", () => {
        const attributes = { TYPE: "PART", URI: '"p.mp4"', "BYTERANGE-START": "100", "BYTERANGE-LENGTH": "50" };
        const hint = { TYPE: PreloadHintType.part, URI: "p.mp4", "BYTERANGE-START": 100n, "BYTERANGE-LENGTH": 50n };
        expect(extXPreloadHintSchema.safeParse(attributes)).toEqual({ success: true, data: hint });
    });

    test.each([{ URI: '"p"' }, { TYPE: "PART" }])("rejects %j", (attributes) => {
        expect(extXPreloadHintSchema.safeParse(attributes).success).toBe(false);
    });
});
