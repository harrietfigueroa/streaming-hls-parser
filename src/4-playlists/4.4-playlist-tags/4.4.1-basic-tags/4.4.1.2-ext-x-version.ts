// Section 4.4.1.2, EXT-X-VERSION. This module is pure: it declares the tag's
// rules and its schema, which converts the tag's value to a bigint.
import { decimalIntegerSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.1.2";

export const EXT_X_VERSION_TAG_NAME = "EXT-X-VERSION";

export const extXVersionRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-VERSION tag's value is a decimal-integer.",
    },
    singleTag: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist contains at most one EXT-X-VERSION tag.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts the EXT-X-VERSION tag's value, the protocol compatibility version number, to a bigint.
 * Section 4.4.1.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.1.2
 */
export const extXVersionSchema = decimalIntegerSchema.describe("EXT-X-VERSION, section 4.4.1.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.1.2");
