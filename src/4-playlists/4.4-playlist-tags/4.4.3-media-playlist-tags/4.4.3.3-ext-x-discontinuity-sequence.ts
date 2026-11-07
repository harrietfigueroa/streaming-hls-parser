// Section 4.4.3.3, EXT-X-DISCONTINUITY-SEQUENCE. This module is pure: it
// declares the tag's rules and its schema, which converts the value to a bigint.
import { decimalIntegerSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.3";

export const EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME = "EXT-X-DISCONTINUITY-SEQUENCE";

export const extXDiscontinuitySequenceRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-DISCONTINUITY-SEQUENCE tag's value is a decimal-integer.",
    },
    precedesSegments: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-DISCONTINUITY-SEQUENCE tag appears before the first Media Segment.",
    },
    precedesDiscontinuity: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-DISCONTINUITY-SEQUENCE tag appears before any EXT-X-DISCONTINUITY tag.",
    },
} as const satisfies Record<string, Rule>;

/** Converts the Discontinuity Sequence Number of the playlist's first Media Segment to a bigint. */
export const extXDiscontinuitySequenceSchema = decimalIntegerSchema;
