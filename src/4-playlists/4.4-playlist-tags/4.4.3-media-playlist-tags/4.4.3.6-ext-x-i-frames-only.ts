// Section 4.4.3.6, EXT-X-I-FRAMES-ONLY. This module is pure: it declares the
// tag's rules and its schema, which accepts only a valueless tag.
import { z } from "zod";

import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.6";

export const EXT_X_I_FRAMES_ONLY_TAG_NAME = "EXT-X-I-FRAMES-ONLY";

export const extXIFramesOnlyRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-I-FRAMES-ONLY tag has no value.",
    },
} as const satisfies Record<string, Rule>;

/** Accepts the raw value of a tag written without a value, true, which is the tag's value per decision 23. */
export const extXIFramesOnlySchema = z.literal(true);
