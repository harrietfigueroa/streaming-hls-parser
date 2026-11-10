// These tests pin section 4.4.3.6: the EXT-X-I-FRAMES-ONLY tag takes no value.
import { describe, expect, test } from "vitest";

import { extXIFramesOnlySchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.6-ext-x-i-frames-only.js";

describe("extXIFramesOnlySchema", () => {
    test("converts the valueless tag to true", () => {
        expect(extXIFramesOnlySchema.safeParse(true)).toEqual({ success: true, data: true });
    });

    test.each(["", "YES"])("rejects the value %j", (value) => {
        expect(extXIFramesOnlySchema.safeParse(value).success).toBe(false);
    });
});
