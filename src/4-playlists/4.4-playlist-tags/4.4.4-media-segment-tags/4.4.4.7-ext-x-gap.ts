// Section 4.4.4.7, EXT-X-GAP. This module is pure: it declares the tag's rules and
// its schema, which accepts only a valueless tag.
import { z } from "zod";

import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.7";

export const EXT_X_GAP_TAG_NAME = "EXT-X-GAP";

export const extXGapRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-GAP tag has no value.",
    },
} as const satisfies Record<string, Rule>;

/** Accepts the raw value of a tag written without a value, true, which is the tag's value per decision 23. */
export const extXGapSchema = z.literal(true);
