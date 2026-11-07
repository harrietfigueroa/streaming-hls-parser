// Section 4.4.2.1, EXT-X-INDEPENDENT-SEGMENTS. This module is pure: it
// declares the tag's rules and its schema, which accepts only a valueless tag.
import { z } from "zod";

import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.2.1";

export const EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME = "EXT-X-INDEPENDENT-SEGMENTS";

export const extXIndependentSegmentsRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-INDEPENDENT-SEGMENTS tag has no value.",
    },
    singleTag: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist contains at most one EXT-X-INDEPENDENT-SEGMENTS tag.",
    },
} as const satisfies Record<string, Rule>;

/** Accepts the raw value of a tag written without a value, true, which is the tag's value per decision 23. */
export const extXIndependentSegmentsSchema = z.literal(true);
