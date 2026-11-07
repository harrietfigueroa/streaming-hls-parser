// Section 4.4.4, Media Segment Tags. This module declares the rules the
// section states for all of its tags.
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4";

export const mediaSegmentTagRules = {
    uriFollowsTags: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Each Media Segment is specified by a series of Media Segment tags followed by a URI.",
    },
} as const satisfies Record<string, Rule>;
