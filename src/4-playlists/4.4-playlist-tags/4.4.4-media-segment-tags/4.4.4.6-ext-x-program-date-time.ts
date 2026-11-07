// Section 4.4.4.6, EXT-X-PROGRAM-DATE-TIME. This module is pure: it declares
// the tag's rules and its schema, which keeps the date-time as written.
import { dateTimeSchema } from "../../../library/date-time.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.6";

export const EXT_X_PROGRAM_DATE_TIME_TAG_NAME = "EXT-X-PROGRAM-DATE-TIME";

export const extXProgramDateTimeRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-PROGRAM-DATE-TIME tag's value is an ISO 8601 date-time, with an offset per decision 27.",
    },
} as const satisfies Record<string, Rule>;

/** Validates the date-time of the next Media Segment's first sample, kept as written per decision 27. */
export const extXProgramDateTimeSchema = dateTimeSchema;
