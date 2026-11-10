// Section 4.4.3.4, EXT-X-ENDLIST. This module is pure: it declares the tag's
// rules and its schema, which accepts only a valueless tag.
import { z } from "zod";

import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.4";

export const EXT_X_ENDLIST_TAG_NAME = "EXT-X-ENDLIST";

export const extXEndlistRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-ENDLIST tag has no value.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Accepts the raw value of a tag written without a value, true, which is the tag's value.
 * Section 4.4.3.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.4
 */
export const extXEndlistSchema = z.literal(true).describe("EXT-X-ENDLIST, section 4.4.3.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.4");
