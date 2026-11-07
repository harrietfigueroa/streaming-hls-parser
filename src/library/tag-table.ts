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
import {
    EXT_X_MEDIA_SEQUENCE_TAG_NAME,
    extXMediaSequenceRules,
    extXMediaSequenceSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.2-ext-x-media-sequence.js";
import {
    EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME,
    extXDiscontinuitySequenceRules,
    extXDiscontinuitySequenceSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.3-ext-x-discontinuity-sequence.js";
import {
    EXT_X_PLAYLIST_TYPE_TAG_NAME,
    extXPlaylistTypeRules,
    extXPlaylistTypeSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.5-ext-x-playlist-type.js";
import {
    EXT_X_I_FRAMES_ONLY_TAG_NAME,
    extXIFramesOnlyRules,
    extXIFramesOnlySchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.6-ext-x-i-frames-only.js";
import {
    EXT_X_PART_INF_TAG_NAME,
    extXPartInfRules,
    extXPartInfSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";
import {
    EXT_X_SERVER_CONTROL_TAG_NAME,
    extXServerControlRules,
    extXServerControlSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";
import { EXTINF_TAG_NAME, extinfRules, extinfSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.1-extinf.js";
import { mediaSegmentTagRules } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4-media-segment-tags.js";
import { EXT_X_BYTERANGE_TAG_NAME, extXByteRangeRules, extXByteRangeSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import {
    EXT_X_DISCONTINUITY_TAG_NAME,
    extXDiscontinuityRules,
    extXDiscontinuitySchema,
} from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.3-ext-x-discontinuity.js";
import {
    EXT_X_PROGRAM_DATE_TIME_TAG_NAME,
    extXProgramDateTimeRules,
    extXProgramDateTimeSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.6-ext-x-program-date-time.js";
import { EXT_X_GAP_TAG_NAME, extXGapRules, extXGapSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.7-ext-x-gap.js";
import { EXT_X_BITRATE_TAG_NAME, extXBitrateRules, extXBitrateSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.8-ext-x-bitrate.js";
import { EXT_X_KEY_TAG_NAME, extXKeyRules, extXKeySchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import { EXT_X_MAP_TAG_NAME, extXMapRules, extXMapSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.5-ext-x-map.js";
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
    /** Broken when the tag appears after the playlist's first Media Segment. */
    readonly precedesSegments?: Rule;
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
    [EXT_X_MEDIA_SEQUENCE_TAG_NAME]: extXMediaSequenceSchema.optional(),
    [EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME]: extXDiscontinuitySequenceSchema.optional(),
    [EXT_X_PLAYLIST_TYPE_TAG_NAME]: extXPlaylistTypeSchema.optional(),
    [EXT_X_I_FRAMES_ONLY_TAG_NAME]: extXIFramesOnlySchema.optional(),
    [EXT_X_PART_INF_TAG_NAME]: extXPartInfSchema.optional(),
    [EXT_X_SERVER_CONTROL_TAG_NAME]: extXServerControlSchema.optional(),
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
    [EXT_X_MEDIA_SEQUENCE_TAG_NAME]: {
        form: ValueForm.text,
        format: extXMediaSequenceRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
        precedesSegments: extXMediaSequenceRules.precedesSegments,
    },
    [EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME]: {
        form: ValueForm.text,
        format: extXDiscontinuitySequenceRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
        precedesSegments: extXDiscontinuitySequenceRules.precedesSegments,
    },
    [EXT_X_PLAYLIST_TYPE_TAG_NAME]: {
        form: ValueForm.text,
        format: extXPlaylistTypeRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
    },
    [EXT_X_I_FRAMES_ONLY_TAG_NAME]: {
        form: ValueForm.text,
        format: extXIFramesOnlyRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
    },
    [EXT_X_PART_INF_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXPartInfRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
    },
    [EXT_X_SERVER_CONTROL_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXServerControlRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
    },
} as const satisfies UnitEntries<typeof mediaPlaylistShape>;

const mediaSegmentShape = {
    [EXTINF_TAG_NAME]: extinfSchema,
    [EXT_X_BYTERANGE_TAG_NAME]: extXByteRangeSchema.optional(),
    [EXT_X_DISCONTINUITY_TAG_NAME]: extXDiscontinuitySchema.optional(),
    [EXT_X_PROGRAM_DATE_TIME_TAG_NAME]: extXProgramDateTimeSchema.optional(),
    [EXT_X_GAP_TAG_NAME]: extXGapSchema.optional(),
    [EXT_X_BITRATE_TAG_NAME]: extXBitrateSchema.optional(),
    [EXT_X_KEY_TAG_NAME]: z.array(extXKeySchema).readonly().optional(),
    [EXT_X_MAP_TAG_NAME]: extXMapSchema.optional(),
} as const;

const mediaSegmentEntries = {
    [EXTINF_TAG_NAME]: {
        form: ValueForm.text,
        format: extinfRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extinfRules.singlePerSegment },
        required: extinfRules.required,
    },
    [EXT_X_BYTERANGE_TAG_NAME]: {
        form: ValueForm.text,
        format: extXByteRangeRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
    },
    [EXT_X_DISCONTINUITY_TAG_NAME]: {
        form: ValueForm.text,
        format: extXDiscontinuityRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
    },
    [EXT_X_PROGRAM_DATE_TIME_TAG_NAME]: {
        form: ValueForm.text,
        format: extXProgramDateTimeRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
    },
    [EXT_X_GAP_TAG_NAME]: {
        form: ValueForm.text,
        format: extXGapRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
    },
    [EXT_X_BITRATE_TAG_NAME]: {
        form: ValueForm.text,
        format: extXBitrateRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
    },
    [EXT_X_KEY_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXKeyRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_MAP_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXMapRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
    },
} as const satisfies UnitEntries<typeof mediaSegmentShape>;

/** The tags the library recognizes, with the runtime zod schemas as their section modules declare them. */
export const defaultTagTables = {
    playlist: { shape: mediaPlaylistShape, entries: mediaPlaylistEntries },
    segment: { shape: mediaSegmentShape, entries: mediaSegmentEntries },
} as const;

export type TagTables = typeof defaultTagTables;
