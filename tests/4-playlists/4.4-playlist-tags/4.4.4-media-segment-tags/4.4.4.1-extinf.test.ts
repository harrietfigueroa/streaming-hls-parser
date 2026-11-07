// These tests pin section 4.4.4.1: EXTINF's value splits at its first comma
// into a numeric duration and a title, which is absent when it is empty or
// entirely whitespace.
import { describe, expect, test } from "vitest";

import { extinfSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.1-extinf.js";

describe("extinfSchema", () => {
    const valid = [
        { value: "9.009,", extinf: { duration: 9.009 } },
        { value: "10,", extinf: { duration: 10 } },
        { value: "10,Opening titles", extinf: { duration: 10, title: "Opening titles" } },
        { value: "10,a,b", extinf: { duration: 10, title: "a,b" } },
        { value: "10,   ", extinf: { duration: 10 } },
    ] as const;

    test.each(valid)("converts $value", ({ value, extinf }) => {
        const result = extinfSchema.safeParse(value);
        expect(result).toEqual({ success: true, data: extinf });
    });

    test.each([true, "", "9.009", ",title", "-1,", "nine,", "1e3,"])("rejects the value %j", (value) => {
        const result = extinfSchema.safeParse(value);
        expect(result.success).toBe(false);
    });

    test("freezes the converted value", () => {
        const result = extinfSchema.safeParse("10,title");
        expect(result.success && Object.isFrozen(result.data)).toBe(true);
    });
});
