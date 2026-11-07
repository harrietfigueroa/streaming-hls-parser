// These tests pin section 4.4.4.9: EXT-X-PART's attributes convert, and each
// Partial Segment's duration stays within the Part Target Duration and, but
// for the section's exceptions, at least 85% of it.
import { describe, expect, test } from "vitest";

import { checkPartDurations, extXPartRules, extXPartSchema } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";

const PART_TARGET = 2;

describe("extXPartSchema", () => {
    test("converts every attribute", () => {
        const attributes = { URI: '"p.mp4"', DURATION: "2", INDEPENDENT: "YES", BYTERANGE: '"100@0"', GAP: "YES" };
        const part = { URI: "p.mp4", DURATION: 2, INDEPENDENT: "YES", BYTERANGE: { length: 100n, offset: 0n }, GAP: "YES" };
        expect(extXPartSchema.safeParse(attributes)).toEqual({ success: true, data: part });
    });

    test.each([{ DURATION: "2" }, { URI: '"p.mp4"' }, { URI: '"p.mp4"', DURATION: "2", BYTERANGE: "100" }])(
        "rejects %j",
        (attributes) => {
            expect(extXPartSchema.safeParse(attributes).success).toBe(false);
        },
    );
});

describe("checkPartDurations", () => {
    test("accepts parts at each bound, a short final part, and the section's exceptions", () => {
        const parts = [
            { URI: "a", DURATION: 1.7 },
            { URI: "b", DURATION: 2 },
            { URI: "c", DURATION: 0.5, INDEPENDENT: "YES" },
            { URI: "d", DURATION: 0.5 },
            { URI: "e", DURATION: 0.5, GAP: "YES" },
            { URI: "f", DURATION: 0.5 },
        ] as const;
        expect(checkPartDurations({ parts, partTarget: PART_TARGET })).toEqual([]);
    });

    test("reports a part longer than the Part Target Duration", () => {
        const parts = [{ URI: "a", DURATION: 2.1 }] as const;
        expect(checkPartDurations({ parts, partTarget: PART_TARGET })).toMatchObject([{ rule: extXPartRules.durationMax }]);
    });

    test("reports a part under 85% of the Part Target Duration", () => {
        const parts = [{ URI: "a", DURATION: 1.6 }, { URI: "b", DURATION: 2 }] as const;
        expect(checkPartDurations({ parts, partTarget: PART_TARGET })).toMatchObject([{ rule: extXPartRules.durationMin }]);
    });
});
