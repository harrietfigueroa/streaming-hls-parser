// Section 4.4.4.9, EXT-X-PART. This module is pure: it declares the tag's
// rules and attribute table, and checks each Partial Segment's duration
// against the Part Target Duration.
import { z } from "zod";

import {
    type AttributeWritersOf,
    attributeListTagSchema,
    decimalFloatingPointSchema,
    enumeratedStringSchema,
    quotedStringSchema,
    writeAsIs,
    writeDecimalFloatingPoint,
    writeQuotedString,
} from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";
import { byteRangeSchema, writeQuotedByteRange } from "./4.4.4.2-ext-x-byterange.js";

const SECTION = "4.4.4.9";

export const EXT_X_PART_TAG_NAME = "EXT-X-PART";

export const extXPartRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-PART has a quoted-string URI and a decimal-floating-point DURATION, and optionally INDEPENDENT and GAP of YES and a quoted-string BYTERANGE of the form <n>[@<o>].",
    },
    parentTagsPrecedeParts: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-DISCONTINUITY, EXT-X-KEY, EXT-X-MAP, and EXT-X-PROGRAM-DATE-TIME applied to a Parent Segment appear before its first EXT-X-PART tag.",
    },
    durationMax: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Partial Segment's duration is at most the Part Target Duration.",
    },
    durationMin: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "A Partial Segment's duration is at least 85% of the Part Target Duration, except with INDEPENDENT=YES or GAP=YES, before a GAP=YES part, or last in its Parent Segment.",
    },
} as const satisfies Record<string, Rule>;

const YES = "YES";

/**
 * Converts EXT-X-PART's attributes, each optional one absent when not written, its byte range as a length and offset.
 * Section 4.4.4.9: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.9
 */
export const extXPartSchema = attributeListTagSchema({
    URI: quotedStringSchema,
    DURATION: decimalFloatingPointSchema,
    INDEPENDENT: enumeratedStringSchema([YES]).optional(),
    BYTERANGE: quotedStringSchema.pipe(byteRangeSchema).optional(),
    GAP: enumeratedStringSchema([YES]).optional(),
})
    .describe("EXT-X-PART, section 4.4.4.9: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.9");

type Part = Pick<z.output<typeof extXPartSchema>, "DURATION" | "INDEPENDENT" | "GAP">;

const DURATION_MIN_FRACTION = 0.85;

function isExemptFromMinimum(options: { readonly part: Part; readonly next: Part | undefined }) {
    const { part, next } = options;
    if (next === undefined) {
        return true;
    }
    const isIndependent = part.INDEPENDENT === YES;
    const isGap = part.GAP === YES;
    const isBeforeGap = next.GAP === YES;
    const isMarked = isIndependent || isGap;
    return isMarked || isBeforeGap;
}

/**
 * Checks the durations of one Parent Segment's Partial Segments, in order, against `partTarget`. The
 * last part is exempt from the minimum as its Parent Segment's final one, including for a Parent
 * Segment whose URI is not yet written.
 */
export function checkPartDurations(options: { readonly parts: readonly Part[]; readonly partTarget: number }) {
    const { parts, partTarget } = options;
    const issues: Issue[] = [];
    const durationMin = partTarget * DURATION_MIN_FRACTION;
    for (const [partIndex, part] of parts.entries()) {
        if (part.DURATION > partTarget) {
            const detail = `Part ${partIndex + 1} lasts ${part.DURATION} s, over the Part Target Duration of ${partTarget} s.`;
            issues.push({ rule: extXPartRules.durationMax, detail });
            continue;
        }
        const next = parts[partIndex + 1];
        const isExempt = isExemptFromMinimum({ part, next });
        const isShort = part.DURATION < durationMin;
        const isTooShort = isShort && !isExempt;
        if (isTooShort) {
            const detail = `Part ${partIndex + 1} lasts ${part.DURATION} s, under ${durationMin} s.`;
            issues.push({ rule: extXPartRules.durationMin, detail });
        }
    }
    return issues;
}

/** EXT-X-PART's attribute writers, in written order. */
export const extXPartAttributeWriters = {
    URI: writeQuotedString,
    DURATION: writeDecimalFloatingPoint,
    INDEPENDENT: writeAsIs,
    BYTERANGE: writeQuotedByteRange,
    GAP: writeAsIs,
} as const satisfies AttributeWritersOf<typeof extXPartSchema>;
