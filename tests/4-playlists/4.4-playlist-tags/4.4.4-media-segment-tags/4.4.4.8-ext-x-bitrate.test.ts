// These tests pin section 4.4.4.8: the bit rate converts as a decimal-integer
// of kilobits per second.
import { describe, expect, test } from "vitest";

import { extXBitrateSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.8-ext-x-bitrate.js";

describe("extXBitrateSchema", () => {
    test("converts the rate", () => {
        expect(extXBitrateSchema.safeParse("1500")).toEqual({ success: true, data: 1500n });
    });

    test.each([true, "", "1.5", "-1"])("rejects the value %j", (value) => {
        expect(extXBitrateSchema.safeParse(value).success).toBe(false);
    });
});
