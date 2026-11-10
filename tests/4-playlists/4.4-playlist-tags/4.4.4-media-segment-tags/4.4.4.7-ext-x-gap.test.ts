// These tests pin section 4.4.4.7: the EXT-X-GAP tag takes no value.
import { describe, expect, test } from "vitest";

import { extXGapSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.7-ext-x-gap.js";

describe("extXGapSchema", () => {
    test("converts the valueless tag to true", () => {
        expect(extXGapSchema.safeParse(true)).toEqual({ success: true, data: true });
    });

    test.each(["", "YES"])("rejects the value %j", (value) => {
        expect(extXGapSchema.safeParse(value).success).toBe(false);
    });
});
