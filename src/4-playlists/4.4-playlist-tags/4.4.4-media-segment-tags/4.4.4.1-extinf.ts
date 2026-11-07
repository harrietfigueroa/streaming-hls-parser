// Section 4.4.4.1, EXTINF. This module is pure: it declares the tag's rules
// and its schema, which splits the value into a duration and a title.
import { z } from "zod";

import { decimalFloatingPointSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.1";

export const EXTINF_TAG_NAME = "EXTINF";

export const extinfRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "The EXTINF tag's value is a decimal-floating-point or decimal-integer duration, a comma, and an optional title.",
    },
    required: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Each Media Segment has an EXTINF tag.",
    },
    singlePerSegment: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Each Media Segment has at most one EXTINF tag, since it applies only to the next Media Segment.",
    },
} as const satisfies Record<string, Rule>;

const DURATION_TITLE_SEPARATOR = ",";
// The duration is everything before the first comma, which must be present.
const EXTINF_FORMAT_PATTERN = /^[^,]+,/;
// Section 4.4.4.1 treats a zero-length or entirely whitespace title as missing.
const MISSING_TITLE_PATTERN = /^\s*$/;

/**
 * Converts EXTINF's split duration to a number, its title absent when missing.
 * Section 4.4.4.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.1
 */
const extinfFieldsSchema = z
    .object({ duration: decimalFloatingPointSchema, title: z.string().optional() })
    .readonly()
    .describe("EXTINF duration and title, section 4.4.4.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.1");
type ExtinfFields = z.input<typeof extinfFieldsSchema>;

function splitExtinf(value: string) {
    const separatorIndex = value.indexOf(DURATION_TITLE_SEPARATOR);
    const duration = value.slice(0, separatorIndex);
    const title = value.slice(separatorIndex + 1);
    if (MISSING_TITLE_PATTERN.test(title)) {
        const untitled: ExtinfFields = { duration };
        return untitled;
    }
    const titled: ExtinfFields = { duration, title };
    return titled;
}

/**
 * Converts the EXTINF tag's value to a frozen `{ duration, title }`, its title absent when missing.
 * Section 4.4.4.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.1
 */
export const extinfSchema = z.string().regex(EXTINF_FORMAT_PATTERN).transform(splitExtinf).pipe(extinfFieldsSchema).describe("EXTINF, section 4.4.4.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.1");
