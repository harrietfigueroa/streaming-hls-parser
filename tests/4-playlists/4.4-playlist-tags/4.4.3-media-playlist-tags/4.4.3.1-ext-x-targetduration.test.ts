// These tests pin section 4.4.3.1: the Target Duration converts as a
// decimal-integer of at least 1, and a segment's duration, rounded to the
// nearest integer, does not exceed it.
import { describe, expect, test } from "vitest";

import { CheckKind } from "../../../../src/library/rule.js";
import {
    checkSegmentDuration,
    extXTargetDurationRules,
    extXTargetDurationSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";

describe("extXTargetDurationSchema", () => {
    test.each([
        { value: "1", targetDuration: 1n },
        { value: "10", targetDuration: 10n },
    ])("converts $value", ({ value, targetDuration }) => {
        const result = extXTargetDurationSchema.safeParse(value);
        expect(result).toEqual({ success: true, data: targetDuration });
    });

    test.each([true, "", "0", "1.5", "-1", "ten"])("rejects the value %j", (value) => {
        const result = extXTargetDurationSchema.safeParse(value);
        expect(result.success).toBe(false);
    });
});

describe("checkSegmentDuration", () => {
    test.each([9.009, 10, 10.4])("accepts the duration %d under a Target Duration of 10", (duration) => {
        const check = checkSegmentDuration({ targetDuration: 10n, duration, segmentIndex: 0 });
        expect(check).toEqual({ kind: CheckKind.passed });
    });

    test.each([10.5, 11])("reports the duration %d under a Target Duration of 10", (duration) => {
        const check = checkSegmentDuration({ targetDuration: 10n, duration, segmentIndex: 0 });
        expect(check).toMatchObject({ kind: CheckKind.failed, issue: { rule: extXTargetDurationRules.durationBound } });
    });
});
