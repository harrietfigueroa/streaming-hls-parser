// Section 4.4.5.2, EXT-X-SKIP. This module is pure: it declares the tag's
// rules and its attribute table as a schema.
import {
    type AttributeWritersOf,
    attributeListTagSchema,
    decimalIntegerSchema,
    possiblyEmptyQuotedStringSchema,
    writeDecimalInteger,
    writeQuotedString,
} from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.5.2";

export const EXT_X_SKIP_TAG_NAME = "EXT-X-SKIP";

export const extXSkipRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-SKIP has a decimal-integer SKIPPED-SEGMENTS, and optionally a quoted-string RECENTLY-REMOVED-DATERANGES.",
    },
    singleTag: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist contains at most one EXT-X-SKIP tag.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts EXT-X-SKIP's attributes; RECENTLY-REMOVED-DATERANGES is the tab-delimited ID list as written.
 * Section 4.4.5.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.5.2
 */
export const extXSkipSchema = attributeListTagSchema({
    "SKIPPED-SEGMENTS": decimalIntegerSchema,
    "RECENTLY-REMOVED-DATERANGES": possiblyEmptyQuotedStringSchema.optional(),
})
    .describe("EXT-X-SKIP, section 4.4.5.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.5.2");

/** EXT-X-SKIP's attribute writers, in written order. */
export const extXSkipAttributeWriters = {
    "SKIPPED-SEGMENTS": writeDecimalInteger,
    "RECENTLY-REMOVED-DATERANGES": writeQuotedString,
} as const satisfies AttributeWritersOf<typeof extXSkipSchema>;
