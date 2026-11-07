// These tests pin section 4.4.6.3: EXT-X-I-FRAME-STREAM-INF takes EXT-X-STREAM-INF's
// attributes but FRAME-RATE, AUDIO, SUBTITLES, and CLOSED-CAPTIONS, and requires a URI.
import { describe, expect, test } from "vitest";

import { extXIFrameStreamInfSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.3-ext-x-i-frame-stream-inf.js";

describe("extXIFrameStreamInfSchema", () => {
    test("converts the spec's example", () => {
        const result = extXIFrameStreamInfSchema.safeParse({ BANDWIDTH: "86000", URI: '"low/iframe.m3u8"' });
        expect(result).toEqual({ success: true, data: { BANDWIDTH: 86000n, URI: "low/iframe.m3u8" } });
    });

    test("keeps a STREAM-INF-only attribute as unrecognized", () => {
        const result = extXIFrameStreamInfSchema.safeParse({ BANDWIDTH: "1", URI: '"a"', AUDIO: '"aac"' });
        expect(result).toEqual({ success: true, data: { BANDWIDTH: 1n, URI: "a", ignored: ['AUDIO="aac"'] } });
    });

    test.each([{ BANDWIDTH: "1" }, { URI: '"a"' }])("rejects %j", (attributes) => {
        expect(extXIFrameStreamInfSchema.safeParse(attributes).success).toBe(false);
    });
});
