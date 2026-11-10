// Section 4.4.3.7, EXT-X-PART-INF. This module is pure: it declares the tag's
// rules and its attribute table as a schema.
import { type AttributeWritersOf, attributeListTagSchema, decimalFloatingPointSchema, writeDecimalFloatingPoint } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.7";

export const EXT_X_PART_INF_TAG_NAME = "EXT-X-PART-INF";

export const extXPartInfRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-PART-INF tag's attribute-list has a decimal-floating-point PART-TARGET.",
    },
    requiredWithParts: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist containing one or more EXT-X-PART tags has an EXT-X-PART-INF tag.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts EXT-X-PART-INF's attributes: PART-TARGET, the Part Target Duration in seconds.
 * Section 4.4.3.7: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.7
 */
export const extXPartInfSchema = attributeListTagSchema({ "PART-TARGET": decimalFloatingPointSchema }).describe("EXT-X-PART-INF, section 4.4.3.7: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.7");

/** EXT-X-PART-INF's attribute writers, in written order. */
export const extXPartInfAttributeWriters = {
    "PART-TARGET": writeDecimalFloatingPoint,
} as const satisfies AttributeWritersOf<typeof extXPartInfSchema>;
