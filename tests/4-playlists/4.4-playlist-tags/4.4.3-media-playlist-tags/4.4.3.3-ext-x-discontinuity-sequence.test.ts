// These tests pin section 4.4.3.3: the Discontinuity Sequence Number converts
// as a decimal-integer.
import { describe, expect, test } from "vitest";

import { extXDiscontinuitySequenceSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.3-ext-x-discontinuity-sequence.js";

describe("extXDiscontinuitySequenceSchema", () => {
    test.each([
        { value: "0", sequence: 0n },
        { value: "12", sequence: 12n },
    ])("converts $value", ({ value, sequence }) => {
        expect(extXDiscontinuitySequenceSchema.safeParse(value)).toEqual({ success: true, data: sequence });
    });

    test.each([true, "", "-1", "x"])("rejects the value %j", (value) => {
        expect(extXDiscontinuitySequenceSchema.safeParse(value).success).toBe(false);
    });
});
