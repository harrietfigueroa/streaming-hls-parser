// These tests pin section 4.4.5.2: EXT-X-SKIP requires SKIPPED-SEGMENTS, and
// RECENTLY-REMOVED-DATERANGES may be empty.
import { describe, expect, test } from "vitest";

import { extXSkipSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.2-ext-x-skip.js";

describe("extXSkipSchema", () => {
    test.each([
        { attributes: { "SKIPPED-SEGMENTS": "3" }, skip: { "SKIPPED-SEGMENTS": 3n } },
        { attributes: { "SKIPPED-SEGMENTS": "3", "RECENTLY-REMOVED-DATERANGES": '""' }, skip: { "SKIPPED-SEGMENTS": 3n, "RECENTLY-REMOVED-DATERANGES": "" } },
    ])("converts $attributes", ({ attributes, skip }) => {
        expect(extXSkipSchema.safeParse(attributes)).toEqual({ success: true, data: skip });
    });

    test.each([{}, { "SKIPPED-SEGMENTS": "-1" }])("rejects %j", (attributes) => {
        expect(extXSkipSchema.safeParse(attributes).success).toBe(false);
    });
});
