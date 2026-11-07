// Section 4.4.2.2, EXT-X-START. This module is pure: it declares the tag's
// rules and its attribute table as a schema.
import {
    attributeListTagSchema,
    enumeratedStringSchema,
    signedDecimalFloatingPointSchema,
} from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.2.2";

export const EXT_X_START_TAG_NAME = "EXT-X-START";

export const extXStartRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "The EXT-X-START tag's attribute-list has a signed-decimal-floating-point TIME-OFFSET and an optional PRECISE of YES or NO.",
    },
    singleTag: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist contains at most one EXT-X-START tag.",
    },
} as const satisfies Record<string, Rule>;

export const Precise = { yes: "YES", no: "NO" } as const;
export type Precise = (typeof Precise)[keyof typeof Precise];

/** Converts EXT-X-START's attributes: TIME-OFFSET in seconds, and PRECISE, absent when not written. */
export const extXStartSchema = attributeListTagSchema({
    "TIME-OFFSET": signedDecimalFloatingPointSchema,
    PRECISE: enumeratedStringSchema([Precise.yes, Precise.no]).optional(),
});
