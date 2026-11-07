// These tests pin section 4.4.4.6: the value is a date-time with an offset,
// kept as written per decision 27.
import { describe, expect, test } from "vitest";

import { extXProgramDateTimeSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.6-ext-x-program-date-time.js";

describe("extXProgramDateTimeSchema", () => {
    test("keeps the spec's example as written", () => {
        const value = "2010-02-19T14:54:23.031+08:00";
        expect(extXProgramDateTimeSchema.safeParse(value)).toEqual({ success: true, data: value });
    });

    test.each([true, "", "2010-02-19"])("rejects the value %j", (value) => {
        expect(extXProgramDateTimeSchema.safeParse(value).success).toBe(false);
    });
});
