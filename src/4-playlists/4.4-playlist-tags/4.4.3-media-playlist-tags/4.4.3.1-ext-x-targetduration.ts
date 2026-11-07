// Section 4.4.3.1, EXT-X-TARGETDURATION. This module is pure: it declares the
// tag's rules and schema, and checks one segment's duration against the
// Target Duration.
import { z } from "zod";

import { decimalIntegerSchema } from "../../4.2-attribute-lists.js";
import { type Check, CheckKind, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.1";

export const EXT_X_TARGETDURATION_TAG_NAME = "EXT-X-TARGETDURATION";

export const extXTargetDurationRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-TARGETDURATION tag's value is a decimal-integer of at least 1.",
    },
    required: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-TARGETDURATION tag is required.",
    },
    durationBound: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "Each Media Segment's EXTINF duration, rounded to the nearest integer, is at most the Target Duration.",
    },
} as const satisfies Record<string, Rule>;

const TARGET_DURATION_MIN = 1n;

/** Converts the EXT-X-TARGETDURATION tag's value, the Target Duration in seconds, to a bigint. */
export const extXTargetDurationSchema = decimalIntegerSchema.pipe(z.bigint().gte(TARGET_DURATION_MIN));

/** Checks that the duration of the segment at `segmentIndex`, rounded to the nearest integer, is at most `targetDuration`. */
export function checkSegmentDuration(options: {
    readonly targetDuration: bigint;
    readonly duration: number;
    readonly segmentIndex: number;
}) {
    const { targetDuration, duration, segmentIndex } = options;
    const roundedDuration = Math.round(duration);
    const isWithinBound = BigInt(roundedDuration) <= targetDuration;
    if (isWithinBound) {
        const passed: Check = { kind: CheckKind.passed };
        return passed;
    }
    const detail = `Segment ${segmentIndex + 1} lasts ${duration} s, over the Target Duration of ${targetDuration} s.`;
    const failed: Check = { kind: CheckKind.failed, issue: { rule: extXTargetDurationRules.durationBound, detail } };
    return failed;
}
