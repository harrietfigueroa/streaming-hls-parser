// These tests pin section 4.4.4.3: the EXT-X-DISCONTINUITY tag takes no value.
import { describe, expect, test } from "vitest";

import { extXDiscontinuitySchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.3-ext-x-discontinuity.js";

describe("extXDiscontinuitySchema", () => {
    test("converts the valueless tag to true", () => {
        expect(extXDiscontinuitySchema.safeParse(true)).toEqual({ success: true, data: true });
    });

    test.each(["", "YES"])("rejects the value %j", (value) => {
        expect(extXDiscontinuitySchema.safeParse(value).success).toBe(false);
    });
});
