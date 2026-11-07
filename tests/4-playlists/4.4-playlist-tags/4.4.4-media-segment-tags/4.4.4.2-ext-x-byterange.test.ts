// These tests pin section 4.4.4.2: the value converts to a length and an
// optional offset, and a segment without an offset follows a sub-range of the
// same resource.
import { describe, expect, test } from "vitest";

import {
    checkByteRangeOffsets,
    extXByteRangeRules,
    extXByteRangeSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";

describe("extXByteRangeSchema", () => {
    test.each([
        { value: "75232@0", byteRange: { length: 75232n, offset: 0n } },
        { value: "82112", byteRange: { length: 82112n } },
    ])("converts $value", ({ value, byteRange }) => {
        expect(extXByteRangeSchema.safeParse(value)).toEqual({ success: true, data: byteRange });
    });

    test.each([true, "", "@0", "1@", "1@2@3", "-1", "1.5@0"])("rejects the value %j", (value) => {
        expect(extXByteRangeSchema.safeParse(value).success).toBe(false);
    });
});

describe("checkByteRangeOffsets", () => {
    test("accepts an offset-less range after a range of the same resource", () => {
        const segments = [
            { uri: "a.ts", "EXT-X-BYTERANGE": { length: 10n, offset: 0n } },
            { uri: "a.ts", "EXT-X-BYTERANGE": { length: 10n } },
        ];
        expect(checkByteRangeOffsets(segments)).toEqual([]);
    });

    test.each([
        { name: "the first segment", segments: [{ uri: "a.ts", "EXT-X-BYTERANGE": { length: 10n } }] },
        { name: "a whole-resource segment", segments: [{ uri: "a.ts" }, { uri: "a.ts", "EXT-X-BYTERANGE": { length: 10n } }] },
        {
            name: "a range of another resource",
            segments: [
                { uri: "a.ts", "EXT-X-BYTERANGE": { length: 10n, offset: 0n } },
                { uri: "b.ts", "EXT-X-BYTERANGE": { length: 10n } },
            ],
        },
    ])("reports an offset-less range after $name", ({ segments }) => {
        expect(checkByteRangeOffsets(segments)).toMatchObject([{ rule: extXByteRangeRules.offsetFollowsSubRange }]);
    });
});
