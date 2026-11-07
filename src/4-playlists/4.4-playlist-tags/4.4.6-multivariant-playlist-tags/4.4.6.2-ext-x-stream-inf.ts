// Section 4.4.6.2, EXT-X-STREAM-INF. This module is pure: it declares the
// tag's rules and attribute table, including REQ-VIDEO-LAYOUT's View
// Presentation Entries.
import { z } from "zod";

import {
    attributeListTagSchema,
    decimalFloatingPointSchema,
    decimalIntegerSchema,
    decimalResolutionSchema,
    enumeratedStringSchema,
    quotedStringSchema,
} from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";
import type { IgnoreReason } from "../../../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";

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
const STABLE_ID_PATTERN = /^[a-zA-Z0-9+/=._-]+$/;

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

const stableIdSchema = quotedStringSchema.pipe(z.string().regex(STABLE_ID_PATTERN));

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

/** Converts EXT-X-STREAM-INF's attributes, each optional one absent when not written; CLOSED-CAPTIONS may be NONE. */
export const extXStreamInfSchema = attributeListTagSchema({
    ...variantStreamAttributes,
    "FRAME-RATE": decimalFloatingPointSchema.optional(),
    AUDIO: quotedStringSchema.optional(),
    SUBTITLES: quotedStringSchema.optional(),
    "CLOSED-CAPTIONS": z.union([quotedStringSchema, z.literal(NONE)]).optional(),
});
