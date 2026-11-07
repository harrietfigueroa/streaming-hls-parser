// The tag table of decision 18: for each unit, a shape mapping each tag's spec
// name to its schema, and a rules map keyed by the same names. Each tag's
// schema and rules stay in its section module; this module assembles them.
import { extm3uRules, EXTM3U_TAG_NAME, extm3uSchema } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import {
    EXT_X_VERSION_TAG_NAME,
    extXVersionRules,
    extXVersionSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.2-ext-x-version.js";
import { mediaPlaylistTagRules } from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3-media-playlist-tags.js";
import {
    EXT_X_TARGETDURATION_TAG_NAME,
    extXTargetDurationRules,
    extXTargetDurationSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import {
    EXT_X_ENDLIST_TAG_NAME,
    extXEndlistRules,
    extXEndlistSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.4-ext-x-endlist.js";
import { EXTINF_TAG_NAME, extinfRules, extinfSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.1-extinf.js";
import type { Rule } from "./rule.js";

/** The rules one tag answers to as a whole, beside the schema converting its value. */
export type TagRules = {
    /** Broken when the tag's value fails its schema. */
    readonly format: Rule;
    /** Broken when the tag appears a second time in its unit. */
    readonly duplicate: Rule;
    /** Broken when the tag is absent from its unit; present exactly when the tag's schema rejects absence. */
    readonly required?: Rule;
};

type UnitRules<Shape> = { readonly [Name in keyof Shape]: TagRules };

const mediaPlaylistShape = {
    [EXTM3U_TAG_NAME]: extm3uSchema,
    [EXT_X_VERSION_TAG_NAME]: extXVersionSchema.optional(),
    [EXT_X_TARGETDURATION_TAG_NAME]: extXTargetDurationSchema,
    [EXT_X_ENDLIST_TAG_NAME]: extXEndlistSchema.optional(),
} as const;

// A second EXTM3U breaks identification: the tag's one position is the first line.
const mediaPlaylistRules = {
    [EXTM3U_TAG_NAME]: {
        format: extm3uRules.format,
        duplicate: extm3uRules.identification,
        required: extm3uRules.identification,
    },
    [EXT_X_VERSION_TAG_NAME]: { format: extXVersionRules.format, duplicate: extXVersionRules.singleTag },
    [EXT_X_TARGETDURATION_TAG_NAME]: {
        format: extXTargetDurationRules.format,
        duplicate: mediaPlaylistTagRules.singleTag,
        required: extXTargetDurationRules.required,
    },
    [EXT_X_ENDLIST_TAG_NAME]: { format: extXEndlistRules.format, duplicate: mediaPlaylistTagRules.singleTag },
} as const satisfies UnitRules<typeof mediaPlaylistShape>;

const mediaSegmentShape = {
    [EXTINF_TAG_NAME]: extinfSchema,
} as const;

const mediaSegmentRules = {
    [EXTINF_TAG_NAME]: {
        format: extinfRules.format,
        duplicate: extinfRules.singlePerSegment,
        required: extinfRules.required,
    },
} as const satisfies UnitRules<typeof mediaSegmentShape>;

/** The tags the library recognizes, with the runtime zod schemas as their section modules declare them. */
export const defaultTagTables = {
    playlist: { shape: mediaPlaylistShape, rules: mediaPlaylistRules },
    segment: { shape: mediaSegmentShape, rules: mediaSegmentRules },
} as const;

export type TagTables = typeof defaultTagTables;
