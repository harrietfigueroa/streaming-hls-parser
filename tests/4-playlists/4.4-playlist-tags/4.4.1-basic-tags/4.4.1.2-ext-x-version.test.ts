// These tests pin section 4.4.1.2: the EXT-X-VERSION tag's value converts as a
// decimal-integer, and every other value, an absent one included, is rejected.
import { describe, expect, test } from "vitest";

import { extXVersionSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.2-ext-x-version.js";

describe("extXVersionSchema", () => {
    const valid = [
        { value: "1", version: 1n },
        { value: "3", version: 3n },
        { value: "12", version: 12n },
    ] as const;

    test.each(valid)("converts $value", ({ value, version }) => {
        const result = extXVersionSchema.safeParse(value);
        expect(result).toEqual({ success: true, data: version });
    });

    test.each([undefined, "", "3.0", "-3", "0x3", " 3", "three"])("rejects the value %j", (value) => {
        const result = extXVersionSchema.safeParse(value);
        expect(result.success).toBe(false);
    });
});
