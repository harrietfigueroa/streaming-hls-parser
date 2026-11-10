// These tests pin section 4.4.4.5: EXT-X-MAP requires a URI, and its optional
// BYTERANGE requires an offset.
import { describe, expect, test } from "vitest";

import { extXMapSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.5-ext-x-map.js";

describe("extXMapSchema", () => {
    test.each([
        { attributes: { URI: '"init.mp4"' }, map: { URI: "init.mp4" } },
        { attributes: { URI: '"main.mp4"', BYTERANGE: '"560@0"' }, map: { URI: "main.mp4", BYTERANGE: { length: 560n, offset: 0n } } },
    ])("converts $attributes", ({ attributes, map }) => {
        expect(extXMapSchema.safeParse(attributes)).toEqual({ success: true, data: map });
    });

    test.each([{}, { URI: '"a"', BYTERANGE: '"560"' }, { URI: '"a"', BYTERANGE: "560@0" }])("rejects %j", (attributes) => {
        expect(extXMapSchema.safeParse(attributes).success).toBe(false);
    });
});
