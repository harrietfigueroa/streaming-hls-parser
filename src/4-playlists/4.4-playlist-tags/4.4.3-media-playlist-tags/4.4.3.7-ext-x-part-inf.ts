// Section 4.4.3.7, EXT-X-PART-INF. This module is pure: it declares the tag's
// rules and its attribute table as a schema.
import { attributeListTagSchema, decimalFloatingPointSchema } from "../../4.2-attribute-lists.js";
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

/** Converts EXT-X-PART-INF's attributes: PART-TARGET, the Part Target Duration in seconds. */
export const extXPartInfSchema = attributeListTagSchema({ "PART-TARGET": decimalFloatingPointSchema });
