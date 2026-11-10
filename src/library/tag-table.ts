// The tag table: for each unit, a shape mapping each tag's spec
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
import { EXT_X_PART_TAG_NAME, extXPartRules, extXPartSchema } from "../4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";
import {
    EXT_X_DATERANGE_TAG_NAME,
    extXDateRangeIgnoreReason,
    extXDateRangeRules,
    extXDateRangeSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.1-ext-x-daterange.js";
import { multivariantPlaylistTagRules } from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6-multivariant-playlist-tags.js";
import {
    EXT_X_MEDIA_TAG_NAME,
    extXMediaRules,
    extXMediaSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import {
    EXT_X_STREAM_INF_TAG_NAME,
    extXStreamInfRules,
    extXStreamInfSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";
import {
    EXT_X_I_FRAME_STREAM_INF_TAG_NAME,
    extXIFrameStreamInfRules,
    extXIFrameStreamInfSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.3-ext-x-i-frame-stream-inf.js";
import {
    EXT_X_SESSION_DATA_TAG_NAME,
    extXSessionDataRules,
    extXSessionDataSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.4-ext-x-session-data.js";
import {
    EXT_X_SESSION_KEY_TAG_NAME,
    extXSessionKeyRules,
    extXSessionKeySchema,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.5-ext-x-session-key.js";
import {
    EXT_X_CONTENT_STEERING_TAG_NAME,
    extXContentSteeringRules,
    extXContentSteeringSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.6-ext-x-content-steering.js";
import {
    type IgnoreReason,
    ignoreReasons,
} from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { EXT_X_SKIP_TAG_NAME, extXSkipRules, extXSkipSchema } from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.2-ext-x-skip.js";
import {
    EXT_X_PRELOAD_HINT_TAG_NAME,
    extXPreloadHintRules,
    extXPreloadHintSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.3-ext-x-preload-hint.js";
import {
    EXT_X_RENDITION_REPORT_TAG_NAME,
    extXRenditionReportRules,
    extXRenditionReportSchema,
} from "../4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.4-ext-x-rendition-report.js";
import type { Rule } from "./rule.js";

/** The two kinds of playlist section 4.4 distinguishes, each with its own tag table. */
export const PlaylistKind = { media: "media", multivariant: "multivariant" } as const;
export type PlaylistKind = (typeof PlaylistKind)[keyof typeof PlaylistKind];

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
    /** A repeated tag's value is a frozen array of its values, in line order. */
    readonly occurrence: Occurrence;
    /** Broken when the tag is absent from its unit; present exactly when the tag's schema rejects absence. */
    readonly required?: Rule;
    /** Broken when the tag appears after the playlist's first Media Segment. */
    readonly precedesSegments?: Rule;
    /** Broken when the tag appears after its Parent Segment's first EXT-X-PART. */
    readonly precedesParts?: Rule;
    /** Why a tag whose syntax is illegal is ignored rather than malformed, where its section says so. */
    readonly ignoreOnFormatFailure?: IgnoreReason;
    /** Why the URI line after the tag is ignored with it, where its section says so; its unit is then dropped. */
    readonly ignoresUri?: IgnoreReason;
};

type UnitEntries<Shape> = { readonly [Name in keyof Shape]: TagEntry };

/** Readies one tag schema for a table, returning a schema of the same type: the schema itself, or its compiled clone. */
export type PrepareSchema = <Schema extends z.ZodType>(schema: Schema) => Schema;

// Sections 4.4.1 and 4.4.2's tags, which either kind of playlist may contain.
function sharedPlaylistShapeOf(prepare: PrepareSchema) {
    return {
        [EXTM3U_TAG_NAME]: prepare(extm3uSchema),
        [EXT_X_VERSION_TAG_NAME]: prepare(extXVersionSchema.optional()),
        [EXT_X_INDEPENDENT_SEGMENTS_TAG_NAME]: prepare(extXIndependentSegmentsSchema.optional()),
        [EXT_X_START_TAG_NAME]: prepare(extXStartSchema.optional()),
        [EXT_X_DEFINE_TAG_NAME]: prepare(z.array(extXDefineSchema).readonly().optional()),
    } as const;
}

function mediaPlaylistShapeOf(prepare: PrepareSchema) {
    const shared = sharedPlaylistShapeOf(prepare);
    return {
        ...shared,
        [EXT_X_TARGETDURATION_TAG_NAME]: prepare(extXTargetDurationSchema),
        [EXT_X_ENDLIST_TAG_NAME]: prepare(extXEndlistSchema.optional()),
        [EXT_X_MEDIA_SEQUENCE_TAG_NAME]: prepare(extXMediaSequenceSchema.optional()),
        [EXT_X_DISCONTINUITY_SEQUENCE_TAG_NAME]: prepare(extXDiscontinuitySequenceSchema.optional()),
        [EXT_X_PLAYLIST_TYPE_TAG_NAME]: prepare(extXPlaylistTypeSchema.optional()),
        [EXT_X_I_FRAMES_ONLY_TAG_NAME]: prepare(extXIFramesOnlySchema.optional()),
        [EXT_X_PART_INF_TAG_NAME]: prepare(extXPartInfSchema.optional()),
        [EXT_X_SERVER_CONTROL_TAG_NAME]: prepare(extXServerControlSchema.optional()),
        [EXT_X_DATERANGE_TAG_NAME]: prepare(z.array(extXDateRangeSchema).readonly().optional()),
        [EXT_X_SKIP_TAG_NAME]: prepare(extXSkipSchema.optional()),
        [EXT_X_PRELOAD_HINT_TAG_NAME]: prepare(z.array(extXPreloadHintSchema).readonly().optional()),
        [EXT_X_RENDITION_REPORT_TAG_NAME]: prepare(z.array(extXRenditionReportSchema).readonly().optional()),
    } as const;
}

// A second EXTM3U breaks identification: the tag's one position is the first line.
const sharedPlaylistEntries = {
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
    [EXT_X_DEFINE_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXDefineRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
} as const satisfies UnitEntries<ReturnType<typeof sharedPlaylistShapeOf>>;

const mediaPlaylistEntries = {
    ...sharedPlaylistEntries,
    [EXT_X_TARGETDURATION_TAG_NAME]: {
        form: ValueForm.text,
        format: extXTargetDurationRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaPlaylistTagRules.singleTag },
        required: extXTargetDurationRules.required,
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
    [EXT_X_DATERANGE_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXDateRangeRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
        ignoreOnFormatFailure: extXDateRangeIgnoreReason,
    },
    [EXT_X_SKIP_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXSkipRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extXSkipRules.singleTag },
    },
    [EXT_X_PRELOAD_HINT_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXPreloadHintRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_RENDITION_REPORT_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXRenditionReportRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
} as const satisfies UnitEntries<ReturnType<typeof mediaPlaylistShapeOf>>;

function mediaSegmentShapeOf(prepare: PrepareSchema) {
    return {
        [EXTINF_TAG_NAME]: prepare(extinfSchema),
        [EXT_X_BYTERANGE_TAG_NAME]: prepare(extXByteRangeSchema.optional()),
        [EXT_X_DISCONTINUITY_TAG_NAME]: prepare(extXDiscontinuitySchema.optional()),
        [EXT_X_PROGRAM_DATE_TIME_TAG_NAME]: prepare(extXProgramDateTimeSchema.optional()),
        [EXT_X_GAP_TAG_NAME]: prepare(extXGapSchema.optional()),
        [EXT_X_BITRATE_TAG_NAME]: prepare(extXBitrateSchema.optional()),
        [EXT_X_KEY_TAG_NAME]: prepare(z.array(extXKeySchema).readonly().optional()),
        [EXT_X_MAP_TAG_NAME]: prepare(extXMapSchema.optional()),
        [EXT_X_PART_TAG_NAME]: prepare(z.array(extXPartSchema).readonly().optional()),
    } as const;
}

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
        precedesParts: extXPartRules.parentTagsPrecedeParts,
    },
    [EXT_X_PROGRAM_DATE_TIME_TAG_NAME]: {
        form: ValueForm.text,
        format: extXProgramDateTimeRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
        precedesParts: extXPartRules.parentTagsPrecedeParts,
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
        precedesParts: extXPartRules.parentTagsPrecedeParts,
    },
    [EXT_X_MAP_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXMapRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: mediaSegmentTagRules.singlePerSegment },
        precedesParts: extXPartRules.parentTagsPrecedeParts,
    },
    [EXT_X_PART_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXPartRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
} as const satisfies UnitEntries<ReturnType<typeof mediaSegmentShapeOf>>;

function multivariantPlaylistShapeOf(prepare: PrepareSchema) {
    const shared = sharedPlaylistShapeOf(prepare);
    return {
        ...shared,
        [EXT_X_MEDIA_TAG_NAME]: prepare(z.array(extXMediaSchema).readonly().optional()),
        [EXT_X_I_FRAME_STREAM_INF_TAG_NAME]: prepare(z.array(extXIFrameStreamInfSchema).readonly().optional()),
        [EXT_X_SESSION_DATA_TAG_NAME]: prepare(z.array(extXSessionDataSchema).readonly().optional()),
        [EXT_X_SESSION_KEY_TAG_NAME]: prepare(z.array(extXSessionKeySchema).readonly().optional()),
        [EXT_X_CONTENT_STEERING_TAG_NAME]: prepare(extXContentSteeringSchema.optional()),
    } as const;
}

const multivariantPlaylistEntries = {
    ...sharedPlaylistEntries,
    [EXT_X_MEDIA_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXMediaRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_I_FRAME_STREAM_INF_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXIFrameStreamInfRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_SESSION_DATA_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXSessionDataRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_SESSION_KEY_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXSessionKeyRules.format,
        occurrence: { kind: OccurrenceKind.repeated },
    },
    [EXT_X_CONTENT_STEERING_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXContentSteeringRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extXContentSteeringRules.singleTag },
    },
} as const satisfies UnitEntries<ReturnType<typeof multivariantPlaylistShapeOf>>;

function variantShapeOf(prepare: PrepareSchema) {
    return {
        [EXT_X_STREAM_INF_TAG_NAME]: prepare(extXStreamInfSchema),
    } as const;
}

// A second EXT-X-STREAM-INF before one URI leaves the first followed by no URI line.
const variantEntries = {
    [EXT_X_STREAM_INF_TAG_NAME]: {
        form: ValueForm.attributeList,
        format: extXStreamInfRules.format,
        occurrence: { kind: OccurrenceKind.once, duplicate: extXStreamInfRules.uriRequired },
        required: extXStreamInfRules.precedesUri,
        ignoresUri: ignoreReasons.followsIgnoredStreamInf,
    },
} as const satisfies UnitEntries<ReturnType<typeof variantShapeOf>>;

/** The rules a kind's tags break by their position rather than their value. */
export type KindRules = {
    /** Broken by one of the kind's playlist tags in a playlist of the other kind. */
    readonly playlistTagOutOfKind: Rule;
    /** Broken by one of the kind's unit tags in a playlist of the other kind. */
    readonly unitTagOutOfKind: Rule;
    /** Broken by unit tags with no URI line after them. */
    readonly uriFollowsTags: Rule;
};

/**
 * The tags the library recognizes, each schema readied by `prepare`, for each kind of playlist: the
 * playlist's own tags, and those of each unit, a Media Segment or a Variant Stream, that a URI line
 * ends. Section 4.4.5's tags are media playlist tags.
 */
export function createTagTables(prepare: PrepareSchema) {
    const mediaPlaylistShape = mediaPlaylistShapeOf(prepare);
    const mediaSegmentShape = mediaSegmentShapeOf(prepare);
    const multivariantPlaylistShape = multivariantPlaylistShapeOf(prepare);
    const variantShape = variantShapeOf(prepare);
    const tables = {
        [PlaylistKind.media]: {
            playlist: { shape: mediaPlaylistShape, entries: mediaPlaylistEntries },
            unit: { shape: mediaSegmentShape, entries: mediaSegmentEntries },
            rules: {
                playlistTagOutOfKind: mediaPlaylistTagRules.notInMultivariant,
                unitTagOutOfKind: mediaSegmentTagRules.notInMultivariant,
                uriFollowsTags: mediaSegmentTagRules.uriFollowsTags,
            },
        },
        [PlaylistKind.multivariant]: {
            playlist: { shape: multivariantPlaylistShape, entries: multivariantPlaylistEntries },
            unit: { shape: variantShape, entries: variantEntries },
            rules: {
                playlistTagOutOfKind: multivariantPlaylistTagRules.notInMedia,
                unitTagOutOfKind: multivariantPlaylistTagRules.notInMedia,
                uriFollowsTags: extXStreamInfRules.uriRequired,
            },
        },
    } as const satisfies {
        readonly [Kind in PlaylistKind]: { readonly playlist: object; readonly unit: object; readonly rules: KindRules };
    };
    return tables;
}

function asDeclared<Schema extends z.ZodType>(schema: Schema) {
    return schema;
}

/** The tag tables with the runtime zod schemas as their section modules declare them. */
export const defaultTagTables = createTagTables(asDeclared);

export type TagTables = ReturnType<typeof createTagTables>;

/** One kind's tag entries by name, for the playlist and for each unit, with the rules its tags break by position. */
export type KindEntries = {
    readonly playlist: ReadonlyMap<string, TagEntry>;
    readonly unit: ReadonlyMap<string, TagEntry>;
    readonly rules: KindRules;
};

export type EntriesByKind = { readonly [Kind in PlaylistKind]: KindEntries };
