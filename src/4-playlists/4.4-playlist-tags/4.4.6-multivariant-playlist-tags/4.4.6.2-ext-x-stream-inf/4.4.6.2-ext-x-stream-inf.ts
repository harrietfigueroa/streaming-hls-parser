// Section 4.4.6.2, EXT-X-STREAM-INF. This module is pure: it declares the
// tag's rules and attribute table, including REQ-VIDEO-LAYOUT's View
// Presentation Entries, and checks the Rendition Groups each variant names.
import { z } from "zod";

import {
    attributeListTagSchema,
    decimalFloatingPointSchema,
    decimalIntegerSchema,
    decimalResolutionSchema,
    enumeratedStringSchema,
    quotedStringSchema,
} from "../../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../../library/rule.js";
import type { IgnoreReason } from "../../../../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { type Media, MediaType, STABLE_ID_PATTERN } from "../4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";

const SECTION = "4.4.6.2";

export const EXT_X_STREAM_INF_TAG_NAME = "EXT-X-STREAM-INF";

export const extXStreamInfRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-STREAM-INF's attributes have the types section 4.4.6.2 defines, with a decimal-integer BANDWIDTH.",
    },
    uriRequired: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-STREAM-INF tag is followed by a URI line.",
    },
    precedesUri: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Each URI line of a Multivariant Playlist follows an EXT-X-STREAM-INF tag, which specifies its Variant Stream.",
    },
    groupReference: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "An AUDIO, VIDEO, SUBTITLES, or quoted-string CLOSED-CAPTIONS attribute matches the GROUP-ID of an EXT-X-MEDIA tag whose TYPE is the attribute's name.",
    },
    closedCaptionsNoneEverywhere: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "When one EXT-X-STREAM-INF tag has CLOSED-CAPTIONS=NONE, every EXT-X-STREAM-INF tag does.",
    },
} as const satisfies Record<string, Rule>;

/** Section 4.4.6.2's instruction to ignore a tag whose REQ-VIDEO-LAYOUT holds an unrecognized specifier. */
export const extXStreamInfIgnoreReason = {
    section: SECTION,
    requirement: "A tag whose REQ-VIDEO-LAYOUT contains an unrecognized enumerated-string is ignored, with the URI line after it.",
} as const satisfies IgnoreReason;

export const HdcpLevel = { type0: "TYPE-0", type1: "TYPE-1", none: "NONE" } as const;
export type HdcpLevel = (typeof HdcpLevel)[keyof typeof HdcpLevel];

export const VideoRange = { sdr: "SDR", hlg: "HLG", pq: "PQ" } as const;
export type VideoRange = (typeof VideoRange)[keyof typeof VideoRange];

export const VideoLayout = {
    stereo: "CH-STEREO",
    mono: "CH-MONO",
    rectilinear: "PROJ-RECT",
    equirectangular: "PROJ-EQUI",
    halfEquirectangular: "PROJ-HEQU",
    parametricImmersive: "PROJ-PRIM",
} as const;
export type VideoLayout = (typeof VideoLayout)[keyof typeof VideoLayout];

const videoLayouts: ReadonlySet<string> = new Set(Object.values(VideoLayout));
const NONE = "NONE";
const ENTRY_SEPARATOR = ",";
const SPECIFIER_SEPARATOR = "/";
// Each specifier's values share a prefix ending at the first '-', and one specifier appears once per entry.
const SPECIFIER_PREFIX_SEPARATOR = "-";

function isVideoLayout(specifier: string): specifier is VideoLayout {
    return videoLayouts.has(specifier);
}

function prefixOf(specifier: string) {
    const separatorIndex = specifier.indexOf(SPECIFIER_PREFIX_SEPARATOR);
    return specifier.slice(0, separatorIndex);
}

/** Parses REQ-VIDEO-LAYOUT's comma-separated View Presentation Entries, each a '/'-separated list of specifiers. */
function parseVideoLayout(value: string, context: z.core.$RefinementCtx<string>) {
    const entries: (readonly VideoLayout[])[] = [];
    for (const entryText of value.split(ENTRY_SEPARATOR)) {
        if (entryText.length === 0) {
            context.addIssue({ code: "custom", message: "REQ-VIDEO-LAYOUT has an empty View Presentation Entry." });
            return z.NEVER;
        }
        const entry: VideoLayout[] = [];
        const prefixes = new Set<string>();
        for (const specifier of entryText.split(SPECIFIER_SEPARATOR)) {
            if (!isVideoLayout(specifier)) {
                const params = { ignoreReason: extXStreamInfIgnoreReason };
                context.addIssue({ code: "custom", message: `Unrecognized REQ-VIDEO-LAYOUT specifier ${specifier}.`, params });
                return z.NEVER;
            }
            const prefix = prefixOf(specifier);
            if (prefixes.has(prefix)) {
                context.addIssue({ code: "custom", message: `REQ-VIDEO-LAYOUT repeats a ${prefix} specifier.` });
                return z.NEVER;
            }
            prefixes.add(prefix);
            entry.push(specifier);
        }
        entries.push(Object.freeze(entry));
    }
    return Object.freeze(entries);
}

/**
 * Unquotes a STABLE-VARIANT-ID and checks its characters.
 * Section 4.4.6.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.2
 */
const stableIdSchema = quotedStringSchema.pipe(z.string().regex(STABLE_ID_PATTERN)).describe("STABLE-VARIANT-ID, section 4.4.6.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.2");

/** The attributes EXT-X-STREAM-INF shares with EXT-X-I-FRAME-STREAM-INF (section 4.4.6.3). */
export const variantStreamAttributes = {
    BANDWIDTH: decimalIntegerSchema,
    "AVERAGE-BANDWIDTH": decimalIntegerSchema.optional(),
    SCORE: decimalFloatingPointSchema.pipe(z.number().positive()).optional(),
    CODECS: quotedStringSchema.optional(),
    "SUPPLEMENTAL-CODECS": quotedStringSchema.optional(),
    RESOLUTION: decimalResolutionSchema.optional(),
    "HDCP-LEVEL": enumeratedStringSchema([HdcpLevel.type0, HdcpLevel.type1, HdcpLevel.none]).optional(),
    "ALLOWED-CPC": quotedStringSchema.optional(),
    "VIDEO-RANGE": enumeratedStringSchema([VideoRange.sdr, VideoRange.hlg, VideoRange.pq]).optional(),
    "REQ-VIDEO-LAYOUT": quotedStringSchema.transform(parseVideoLayout).optional(),
    "STABLE-VARIANT-ID": stableIdSchema.optional(),
    VIDEO: quotedStringSchema.optional(),
    "PATHWAY-ID": quotedStringSchema.optional(),
} as const;

/**
 * Converts EXT-X-STREAM-INF's attributes, each optional one absent when not written; CLOSED-CAPTIONS may be NONE.
 * Section 4.4.6.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.2
 */
export const extXStreamInfSchema = attributeListTagSchema({
    ...variantStreamAttributes,
    "FRAME-RATE": decimalFloatingPointSchema.optional(),
    AUDIO: quotedStringSchema.optional(),
    SUBTITLES: quotedStringSchema.optional(),
    "CLOSED-CAPTIONS": z.union([quotedStringSchema, z.literal(NONE)]).optional(),
})
    .describe("EXT-X-STREAM-INF, section 4.4.6.2: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.2");

/** One converted EXT-X-STREAM-INF tag. */
export type StreamInf = Readonly<z.output<typeof extXStreamInfSchema>>;

// Each Rendition Group attribute names a Group of the TYPE spelled as the attribute's name.
const GROUP_ATTRIBUTES = [
    { attribute: "AUDIO", type: MediaType.audio },
    { attribute: "VIDEO", type: MediaType.video },
    { attribute: "SUBTITLES", type: MediaType.subtitles },
    { attribute: "CLOSED-CAPTIONS", type: MediaType.closedCaptions },
] as const;

function toGroupIdsByType(renditions: Iterable<Media>) {
    const groupIdsByType = new Map<MediaType, Set<string>>();
    for (const media of renditions) {
        let groupIds = groupIdsByType.get(media.TYPE);
        if (groupIds === undefined) {
            groupIds = new Set();
            groupIdsByType.set(media.TYPE, groupIds);
        }
        groupIds.add(media["GROUP-ID"]);
    }
    return groupIdsByType;
}

/**
 * Checks that every variant's and I-frame stream's Rendition Group attributes name a Group of their
 * TYPE, and that CLOSED-CAPTIONS=NONE is on every variant or none. EXT-X-I-FRAME-STREAM-INF shares
 * VIDEO alone of these attributes, as section 4.4.6.3 defines.
 */
export function checkRenditionReferences(options: {
    readonly streamInfs: readonly StreamInf[];
    readonly iFrameStreamInfs: readonly { readonly VIDEO?: string | undefined }[];
    readonly media: Iterable<Media>;
}) {
    const issues: Issue[] = [];
    const groupIdsByType = toGroupIdsByType(options.media);
    let noneCount = 0;
    for (const [streamInfIndex, streamInf] of options.streamInfs.entries()) {
        for (const { attribute, type } of GROUP_ATTRIBUTES) {
            const groupId = streamInf[attribute];
            if (groupId === undefined) {
                continue;
            }
            const isNone = attribute === "CLOSED-CAPTIONS" && groupId === NONE;
            if (isNone) {
                noneCount += 1;
                continue;
            }
            if (groupIdsByType.get(type)?.has(groupId) !== true) {
                const detail = `Variant ${streamInfIndex + 1}: ${attribute}="${groupId}" names no ${type} Group.`;
                issues.push({ rule: extXStreamInfRules.groupReference, detail });
            }
        }
    }
    for (const [iFrameIndex, iFrameStreamInf] of options.iFrameStreamInfs.entries()) {
        const groupId = iFrameStreamInf.VIDEO;
        const isUnmatched = groupId !== undefined && groupIdsByType.get(MediaType.video)?.has(groupId) !== true;
        if (isUnmatched) {
            const detail = `I-frame stream ${iFrameIndex + 1}: VIDEO="${String(groupId)}" names no VIDEO Group.`;
            issues.push({ rule: extXStreamInfRules.groupReference, detail });
        }
    }
    const hasNone = noneCount > 0;
    const isPartialNone = hasNone && noneCount < options.streamInfs.length;
    if (isPartialNone) {
        const detail = `${noneCount} of ${options.streamInfs.length} EXT-X-STREAM-INF tags have CLOSED-CAPTIONS=NONE.`;
        issues.push({ rule: extXStreamInfRules.closedCaptionsNoneEverywhere, detail });
    }
    return issues;
}
