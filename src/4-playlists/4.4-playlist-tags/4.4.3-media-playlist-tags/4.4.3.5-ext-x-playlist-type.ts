// Section 4.4.3.5, EXT-X-PLAYLIST-TYPE. This module is pure: it declares the
// tag's rules and its schema, which accepts EVENT or VOD.
import { enumeratedStringSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.5";

export const EXT_X_PLAYLIST_TYPE_TAG_NAME = "EXT-X-PLAYLIST-TYPE";

export const extXPlaylistTypeRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-PLAYLIST-TYPE tag's value is EVENT or VOD.",
    },
} as const satisfies Record<string, Rule>;

export const PlaylistType = { event: "EVENT", vod: "VOD" } as const;
export type PlaylistType = (typeof PlaylistType)[keyof typeof PlaylistType];

/**
 * Accepts the playlist's mutability: EVENT, or VOD.
 * Section 4.4.3.5: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.5
 */
export const extXPlaylistTypeSchema = enumeratedStringSchema([PlaylistType.event, PlaylistType.vod]).describe("EXT-X-PLAYLIST-TYPE, section 4.4.3.5: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.5");
