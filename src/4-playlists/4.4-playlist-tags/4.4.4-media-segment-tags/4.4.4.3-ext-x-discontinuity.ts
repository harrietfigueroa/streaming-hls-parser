// Section 4.4.4.3, EXT-X-DISCONTINUITY. This module is pure: it declares the tag's rules and
// its schema, which accepts only a valueless tag.
import { z } from "zod";

import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.3";

export const EXT_X_DISCONTINUITY_TAG_NAME = "EXT-X-DISCONTINUITY";

export const extXDiscontinuityRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-DISCONTINUITY tag has no value.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Accepts the raw value of a tag written without a value, true, which is the tag's value.
 * Section 4.4.4.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.3
 */
export const extXDiscontinuitySchema = z.literal(true).describe("EXT-X-DISCONTINUITY, section 4.4.4.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.3");
