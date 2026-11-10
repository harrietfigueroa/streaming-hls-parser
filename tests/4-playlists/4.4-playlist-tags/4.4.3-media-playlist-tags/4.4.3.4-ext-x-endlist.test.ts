// These tests pin section 4.4.3.4: the EXT-X-ENDLIST tag takes no value, so
// only the raw value of a valueless tag converts.
import { describe, expect, test } from "vitest";

import { extXEndlistSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.4-ext-x-endlist.js";

describe("extXEndlistSchema", () => {
    test("converts the valueless tag to true", () => {
        const result = extXEndlistSchema.safeParse(true);
        expect(result).toEqual({ success: true, data: true });
    });

    test.each(["", "YES"])("rejects the value %j", (value) => {
        const result = extXEndlistSchema.safeParse(value);
        expect(result.success).toBe(false);
    });
});
