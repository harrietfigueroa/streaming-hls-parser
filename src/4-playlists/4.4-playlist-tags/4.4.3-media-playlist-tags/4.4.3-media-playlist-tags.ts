// Section 4.4.3, Media Playlist Tags. This module declares the rules the
// section states for all of its tags.
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3";

export const mediaPlaylistTagRules = {
    singleTag: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Media Playlist contains at most one Media Playlist tag of each type.",
    },
} as const satisfies Record<string, Rule>;
