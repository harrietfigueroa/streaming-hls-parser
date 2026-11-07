// The tag table of decision 18: for each unit, a shape mapping each tag's spec
// name to its schema, and an entries map keyed by the same names. Each tag's
// schema and rules stay in its section module; this module assembles them.
import { z } from "zod";

import { extm3uRules, EXTM3U_TAG_NAME, extm3uSchema } from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import {
    EXT_X_VERSION_TAG_NAME,
    extXVersionRules,
    extXVersionSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.2-ext-x-version.js";
import {
    EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME,
    extXIndependentSegmentsRules,
    extXIndependentSegmentsSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.1-ext-x-independent-segments.js";
import {
    EXT_X_START_TAG_NAME,
    extXStartRules,
    extXStartSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.2-ext-x-start.js";
import {
    EXT_X_DEFINE_TAG_NAME,
    extXDefineRules,
    extXDefineSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";
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

/** How the scanner reads a tag's raw value: as the text after ':', or as an attribute-list. */
export const ValueForm = { text: "text", attributeList: "attributeList" } as const;
export type ValueForm = (typeof ValueForm)[keyof typeof ValueForm];

/** Whether a tag appears at most once in its unit, and the rule a second one breaks, or may repeat. */
export const OccurrenceKind = { once: "once", repeated: "repeated" } as const;
export type OccurrenceKind = (typeof OccurrenceKind)[keyof typeof OccurrenceKind];

type OccurrencePayloads = {
    [OccurrenceKind.once]: { readonly duplicate: Rule };
    [OccurrenceKind.repeated]: Record<never, never>;
};
type OccurrenceMember<K extends OccurrenceKind> = { readonly kind: K } & OccurrencePayloads[K];
export type Occurrence = { [K in OccurrenceKind]: OccurrenceMember<K> }[OccurrenceKind];

/** What the library knows about one tag beside the schema converting its value. */
export type TagEntry = {
    readonly form: ValueForm;
    /** Broken when the tag's value fails its schema. */
    readonly format: Rule;
    /** A repeated tag's value is a frozen array of its values, in order, per decision 23. */
    readonly occurrence: Occurrence;
    /** Broken when the tag is absent from its unit; present exactly when the tag's schema rejects absence. */
    readonly required?: Rule;
};

type UnitEntries<Shape> = { readonly [Name in keyof Shape]: TagEntry };

const mediaPlaylistShape = {
    [EXTM3U_TAG_NAME]: extm3uSchema,
    [EXT_X_VERSION_TAG_NAME]: extXVersionSchema.optional(),
    [EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME]: extXIndependentSegmentsSchema.optional(),
    [EXT_X_START_TAG_NAME]: extXStartSchema.optional(),
    [EXT_X_DEFINE_TAG_NAME]: z.array(extXDefineSchema).readonly().optional(),
    [EXT_X_TARGETDURATION_TAG_NAME]: extXTargetDurationSchema,
    [EXT_X_ENDLIST_TAG_NAME]: extXEndlistSchema.optional(),
} as const;

// A second EXTM3U breaks identification: the tag's one position is the first line.
const mediaPlaylistEntries = {
    [EXTM3U_TAG_NAME]: {
        form: ValueForm.text,
        format: extm3uRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extm3uRules.identification },
        required: extm3uRules.identification,
    },
    [EXT_X_VERSION_TAG_NAME]: {
        form: ValueForm.text,
        format: extXVersionRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extXVersionRules.singleTag },
    },
    [EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME]: {
        form: ValueForm.text,
        format: extXIndependentSegmentsRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extXIndependentSegmentsRules.singleTag },
    },
    [EXT_X_START_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXStartRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extXStartRules.singleTag },
    },
    [EXT_X_TARGETDURATION_TAG_NAME]: {
        form: ValueForm.text,
        format: extXTargetDurationRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
        required: extXTargetDurationRules.required,
    },
    [EXT_X_DEFINE_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXDefineRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_ENDLIST_TAG_NAME]: {
        form: ValueForm.text,
        format: extXEndlistRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
    },
} as const satisfies UnitEntries<typeof mediaPlaylistShape>;

const mediaSegmentShape = {
    [EXTINF_TAG_NAME]: extinfSchema,
} as const;

const mediaSegmentEntries = {
    [EXTINF_TAG_NAME]: {
        form: ValueForm.text,
        format: extinfRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extinfRules.singlePerSegment },
        required: extinfRules.required,
    },
} as const satisfies UnitEntries<typeof mediaSegmentShape>;

/** The tags the library recognizes, with the runtime zod schemas as their section modules declare them. */
export const defaultTagTables = {
    playlist: { shape: mediaPlaylistShape, entries: mediaPlaylistEntries },
    segment: { shape: mediaSegmentShape, entries: mediaSegmentEntries },
} as const;

export type TagTables = typeof defaultTagTables;
