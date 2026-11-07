// Section 4.4.6, Multivariant Playlist Tags. This module declares the rules the
// section states for all of its tags.
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.6";

export const multivariantPlaylistTagRules = {
    notInMedia: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist does not contain both a Multivariant Playlist tag and a Media Playlist or Media Segment tag.",
    },
} as const satisfies Record<string, Rule>;
