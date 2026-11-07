// These tests pin section 4.4.2.1: the EXT-X-INDEPENDENT-SEGMENTS tag takes no
// value, so only the raw value of a valueless tag converts.
import { describe, expect, test } from "vitest";

import { extXIndependentSegmentsSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.1-ext-x-independent-segments.js";

describe("extXIndependentSegmentsSchema", () => {
    test("converts the valueless tag to true", () => {
        const result = extXIndependentSegmentsSchema.safeParse(true);
        expect(result).toEqual({ success: true, data: true });
    });

    test.each(["", "YES"])("rejects the value %j", (value) => {
        const result = extXIndependentSegmentsSchema.safeParse(value);
        expect(result.success).toBe(false);
    });
});
