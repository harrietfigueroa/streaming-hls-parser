// These tests pin section 4.4.3.2: the Media Sequence Number converts as a
// decimal-integer.
import { describe, expect, test } from "vitest";

import { extXMediaSequenceSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.2-ext-x-media-sequence.js";

describe("extXMediaSequenceSchema", () => {
    test.each([
        { value: "0", sequence: 0n },
        { value: "2680", sequence: 2680n },
    ])("converts $value", ({ value, sequence }) => {
        expect(extXMediaSequenceSchema.safeParse(value)).toEqual({ success: true, data: sequence });
    });

    test.each([true, "", "-1", "1.5"])("rejects the value %j", (value) => {
        expect(extXMediaSequenceSchema.safeParse(value).success).toBe(false);
    });
});
