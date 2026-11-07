// These tests pin section 4.4.3.8: EXT-X-SERVER-CONTROL's attributes convert,
// and each bound the section sets against the Target Duration and the Part
// Target Duration is checked, with each rule broken once.
import { describe, expect, test } from "vitest";

import {
    checkServerControl,
    extXServerControlRules,
    extXServerControlSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";

const TARGET_DURATION = 4n;
const PART_TARGET = 1;

describe("extXServerControlSchema", () => {
    test("converts every attribute", () => {
        const attributes = {
            "CAN-SKIP-UNTIL": "24",
            "CAN-SKIP-DATERANGES": "YES",
            "HOLD-BACK": "12",
            "PART-HOLD-BACK": "3",
            "CAN-BLOCK-RELOAD": "YES",
        };
        const serverControl = {
            "CAN-SKIP-UNTIL": 24,
            "CAN-SKIP-DATERANGES": "YES",
            "HOLD-BACK": 12,
            "PART-HOLD-BACK": 3,
            "CAN-BLOCK-RELOAD": "YES",
        };
        expect(extXServerControlSchema.safeParse(attributes)).toEqual({ success: true, data: serverControl });
    });

    test.each([{ "HOLD-BACK": "-1" }, { "CAN-BLOCK-RELOAD": "NO" }])("rejects %j", (attributes) => {
        expect(extXServerControlSchema.safeParse(attributes).success).toBe(false);
    });
});

describe("checkServerControl", () => {
    test("accepts values at each bound", () => {
        const serverControl = { "CAN-SKIP-UNTIL": 24, "CAN-SKIP-DATERANGES": "YES", "HOLD-BACK": 12, "PART-HOLD-BACK": 2 } as const;
        const issues = checkServerControl({ serverControl, targetDuration: TARGET_DURATION, partTarget: PART_TARGET });
        expect(issues).toEqual([]);
    });

    test("accepts a playlist with neither tag", () => {
        expect(checkServerControl({ targetDuration: TARGET_DURATION })).toEqual([]);
    });

    const broken = [
        { name: "a Skip Boundary under six Target Durations", serverControl: { "CAN-SKIP-UNTIL": 23.9 }, rule: extXServerControlRules.skipBoundary },
        { name: "CAN-SKIP-DATERANGES without CAN-SKIP-UNTIL", serverControl: { "CAN-SKIP-DATERANGES": "YES" }, rule: extXServerControlRules.skipDateRangesWithSkipUntil },
        { name: "a HOLD-BACK under three Target Durations", serverControl: { "HOLD-BACK": 11 }, rule: extXServerControlRules.holdBack },
    ] as const;

    test.each(broken)("reports $name", ({ serverControl, rule }) => {
        const issues = checkServerControl({ serverControl, targetDuration: TARGET_DURATION });
        expect(issues).toMatchObject([{ rule }]);
    });

    test("reports a PART-HOLD-BACK under twice the Part Target Duration", () => {
        const serverControl = { "PART-HOLD-BACK": 1.9 } as const;
        const issues = checkServerControl({ serverControl, targetDuration: TARGET_DURATION, partTarget: PART_TARGET });
        expect(issues).toMatchObject([{ rule: extXServerControlRules.partHoldBack }]);
    });

    test.each([{ serverControl: {} }, {}])("reports EXT-X-PART-INF without a PART-HOLD-BACK in %j", (options) => {
        const issues = checkServerControl({ ...options, targetDuration: TARGET_DURATION, partTarget: PART_TARGET });
        expect(issues).toMatchObject([{ rule: extXServerControlRules.partHoldBackRequired }]);
    });
});
