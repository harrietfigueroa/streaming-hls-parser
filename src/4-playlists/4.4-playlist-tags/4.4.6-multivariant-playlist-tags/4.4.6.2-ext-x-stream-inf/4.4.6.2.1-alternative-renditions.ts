// Section 4.4.6.2.1, Alternative Renditions. This module is pure: it declares
// the section's rule on an EXT-X-MEDIA tag's URI and checks it. The section's
// bandwidth, resolution, and Variant Stream constraints concern the media
// itself, which no playlist line states.
import { type Issue, type Rule, Severity } from "../../../../library/rule.js";
import { type Media, MediaType } from "../4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";

const SECTION = "4.4.6.2.1";

export const alternativeRenditionRules = {
    subtitlesUri: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-MEDIA tag whose TYPE is SUBTITLES has a URI.",
    },
} as const satisfies Record<string, Rule>;

/** Checks the URI one Rendition's TYPE requires. */
export function checkAlternativeRendition(media: Media) {
    const issues: Issue[] = [];
    const isSubtitles = media.TYPE === MediaType.subtitles;
    const isSubtitlesWithoutUri = isSubtitles && media.URI === undefined;
    if (isSubtitlesWithoutUri) {
        issues.push({ rule: alternativeRenditionRules.subtitlesUri, detail: `NAME="${media.NAME}" is SUBTITLES and has no URI.` });
    }
    return issues;
}
