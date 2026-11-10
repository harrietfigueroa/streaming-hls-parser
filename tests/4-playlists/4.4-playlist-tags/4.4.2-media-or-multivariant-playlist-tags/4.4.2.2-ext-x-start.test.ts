// These tests pin section 4.4.2.2: EXT-X-START's attributes convert as the
// section defines them, with TIME-OFFSET required and PRECISE limited to YES
// and NO.
import { describe, expect, test } from "vitest";

import {
    extXStartSchema,
    Precise,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.2-ext-x-start.js";

describe("extXStartSchema", () => {
    const valid = [
        { attributes: { "TIME-OFFSET": "10.5" }, start: { "TIME-OFFSET": 10.5 } },
        { attributes: { "TIME-OFFSET": "-3", PRECISE: "YES" }, start: { "TIME-OFFSET": -3, PRECISE: Precise.yes } },
        { attributes: { "TIME-OFFSET": "0", PRECISE: "NO" }, start: { "TIME-OFFSET": 0, PRECISE: Precise.no } },
    ] as const;

    test.each(valid)("converts $attributes", ({ attributes, start }) => {
        const result = extXStartSchema.safeParse(attributes);
        expect(result).toEqual({ success: true, data: start });
    });

    test.each([{}, { PRECISE: "YES" }, { "TIME-OFFSET": "ten" }, { "TIME-OFFSET": "1", PRECISE: "yes" }])(
        "rejects %j",
        (attributes) => {
            const result = extXStartSchema.safeParse(attributes);
            expect(result.success).toBe(false);
        },
    );
});
