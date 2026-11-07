// Section 4.4.4.8, EXT-X-BITRATE. This module is pure: it declares the tag's
// rules and its schema, which converts the rate to a bigint. The section's
// bound against each segment's measured bit rate needs the media itself, which
// a playlist parser does not have.
import { decimalIntegerSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.8";

export const EXT_X_BITRATE_TAG_NAME = "EXT-X-BITRATE";

export const extXBitrateRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-BITRATE tag's value is a decimal-integer of kilobits per second.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts the approximate segment bit rate, in kilobits per second, to a bigint.
 * Section 4.4.4.8: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.8
 */
export const extXBitrateSchema = decimalIntegerSchema.describe("EXT-X-BITRATE, section 4.4.4.8: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.8");
