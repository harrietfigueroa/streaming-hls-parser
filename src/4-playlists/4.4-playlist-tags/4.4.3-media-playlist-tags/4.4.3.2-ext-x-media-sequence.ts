// Section 4.4.3.2, EXT-X-MEDIA-SEQUENCE. This module is pure: it declares the
// tag's rules and its schema, which converts the value to a bigint.
import { decimalIntegerSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.2";

export const EXT_X_MEDIA_SEQUENCE_TAG_NAME = "EXT-X-MEDIA-SEQUENCE";

export const extXMediaSequenceRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-MEDIA-SEQUENCE tag's value is a decimal-integer.",
    },
    precedesSegments: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-MEDIA-SEQUENCE tag appears before the first Media Segment.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts the Media Sequence Number of the playlist's first Media Segment to a bigint.
 * Section 4.4.3.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.2
 */
export const extXMediaSequenceSchema = decimalIntegerSchema.describe("EXT-X-MEDIA-SEQUENCE, section 4.4.3.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.2");
