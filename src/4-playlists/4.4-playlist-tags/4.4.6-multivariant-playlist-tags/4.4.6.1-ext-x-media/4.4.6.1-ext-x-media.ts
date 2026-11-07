// Section 4.4.6.1, EXT-X-MEDIA. This module is pure: it declares the tag's
// rules and attribute table, splits CHANNELS and CHARACTERISTICS into their
// parameters, and checks the attributes each TYPE requires or forbids.
import { z } from "zod";

import { attributeListTagSchema, decimalIntegerSchema, enumeratedStringSchema, quotedStringSchema } from "../../../4.2-attribute-lists.js";
import { assertCondition } from "../../../../library/assert.js";
import { type Issue, type Rule, Severity } from "../../../../library/rule.js";

const SECTION = "4.4.6.1";

export const EXT_X_MEDIA_TAG_NAME = "EXT-X-MEDIA";

export const extXMediaRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-MEDIA's attributes have the types section 4.4.6.1 defines, with an enumerated-string TYPE and a quoted-string GROUP-ID and NAME.",
    },
    closedCaptionsUri: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-MEDIA tag whose TYPE is CLOSED-CAPTIONS has no URI.",
    },
    closedCaptionsInstreamId: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-MEDIA tag whose TYPE is CLOSED-CAPTIONS has an INSTREAM-ID of CC1 to CC4 or SERVICE1 to SERVICE63.",
    },
    instreamIdCharacters: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An INSTREAM-ID of a TYPE other than CLOSED-CAPTIONS holds only characters from [A-Z], [a-z], [0-9], and '.'.",
    },
    autoselectWithDefault: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-MEDIA tag with DEFAULT=YES and an AUTOSELECT attribute has AUTOSELECT=YES.",
    },
    forcedSubtitlesOnly: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-MEDIA tag has a FORCED attribute only when its TYPE is SUBTITLES.",
    },
    audioOnly: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-MEDIA tag has a BIT-DEPTH, SAMPLE-RATE, or CHANNELS attribute only when its TYPE is AUDIO.",
    },
} as const satisfies Record<string, Rule>;

export const MediaType = { audio: "AUDIO", video: "VIDEO", subtitles: "SUBTITLES", closedCaptions: "CLOSED-CAPTIONS" } as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

/** The values of DEFAULT, AUTOSELECT, and FORCED. */
export const YesNo = { yes: "YES", no: "NO" } as const;
export type YesNo = (typeof YesNo)[keyof typeof YesNo];

/** The characters of a STABLE-RENDITION-ID, which section 4.4.6.2 gives a STABLE-VARIANT-ID too. */
export const STABLE_ID_PATTERN = /^[a-zA-Z0-9+/=._-]+$/;

const PARAMETER_SEPARATOR = "/";
const LIST_SEPARATOR = ",";
// CHANNELS holds a channel count, then the Audio Coding Identifiers, then the Special Usage Identifiers.
const CHANNELS_PARAMETER_COUNT_MAX = 3;
const IDENTIFIER_PATTERN = /^[A-Z0-9-]+$/;
const INSTREAM_ID_PATTERN = /^[A-Za-z0-9.]+$/;
const SERVICE_PATTERN = /^SERVICE([1-9][0-9]?)$/;
const SERVICE_NUMBER_MAX = 63;
const LINE_21_CHANNELS: ReadonlySet<string> = new Set(["CC1", "CC2", "CC3", "CC4"]);

/** CHANNELS split into its parameters, each identifier list absent when its parameter is not written. */
export type Channels = {
    readonly count: bigint;
    readonly audioCodingIdentifiers?: readonly string[];
    readonly specialUsageIdentifiers?: readonly string[];
};

function isIdentifier(text: string) {
    return IDENTIFIER_PATTERN.test(text);
}

function areIdentifiers(identifiers: readonly string[]) {
    for (const identifier of identifiers) {
        if (!isIdentifier(identifier)) {
            return false;
        }
    }
    return true;
}

/** Parses CHANNELS' '/'-separated parameters: a decimal-integer count, then up to two comma-separated identifier lists. */
function parseChannels(value: string, context: z.core.$RefinementCtx<string>) {
    const parameters = value.split(PARAMETER_SEPARATOR);
    if (parameters.length > CHANNELS_PARAMETER_COUNT_MAX) {
        context.addIssue({ code: "custom", message: `CHANNELS has ${parameters.length} parameters.` });
        return z.NEVER;
    }
    const [countText, audioCodingText, specialUsageText] = parameters;
    assertCondition(countText !== undefined, "A split string has no first element.");
    const count = decimalIntegerSchema.safeParse(countText);
    if (!count.success) {
        context.addIssue({ code: "custom", message: "CHANNELS' first parameter is no decimal-integer." });
        return z.NEVER;
    }
    if (audioCodingText === undefined) {
        const channels: Channels = { count: count.data };
        return Object.freeze(channels);
    }
    // An empty second parameter is an empty list, which a third parameter may not follow.
    const isEmptyAudioCoding = audioCodingText.length === 0;
    if (isEmptyAudioCoding) {
        if (specialUsageText !== undefined) {
            context.addIssue({ code: "custom", message: "CHANNELS has Special Usage Identifiers and no Audio Coding Identifiers." });
            return z.NEVER;
        }
        const channels: Channels = { count: count.data, audioCodingIdentifiers: Object.freeze([]) };
        return Object.freeze(channels);
    }
    const audioCodingIdentifiers = audioCodingText.split(LIST_SEPARATOR);
    if (!areIdentifiers(audioCodingIdentifiers)) {
        context.addIssue({ code: "custom", message: "CHANNELS' second parameter holds an invalid identifier." });
        return z.NEVER;
    }
    if (specialUsageText === undefined) {
        const channels: Channels = { count: count.data, audioCodingIdentifiers: Object.freeze(audioCodingIdentifiers) };
        return Object.freeze(channels);
    }
    const specialUsageIdentifiers = specialUsageText.split(LIST_SEPARATOR);
    if (!areIdentifiers(specialUsageIdentifiers)) {
        context.addIssue({ code: "custom", message: "CHANNELS' third parameter holds an invalid identifier." });
        return z.NEVER;
    }
    const channels: Channels = {
        count: count.data,
        audioCodingIdentifiers: Object.freeze(audioCodingIdentifiers),
        specialUsageIdentifiers: Object.freeze(specialUsageIdentifiers),
    };
    return Object.freeze(channels);
}

/** Parses CHARACTERISTICS' comma-separated Media Characteristic Tags, none of them empty. */
function parseCharacteristics(value: string, context: z.core.$RefinementCtx<string>) {
    const characteristics = value.split(LIST_SEPARATOR);
    for (const characteristic of characteristics) {
        if (characteristic.length === 0) {
            context.addIssue({ code: "custom", message: "CHARACTERISTICS has an empty Media Characteristic Tag." });
            return z.NEVER;
        }
    }
    return Object.freeze(characteristics);
}

/**
 * Validates DEFAULT, AUTOSELECT, and FORCED, each YES or NO.
 * Section 4.4.6.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.1
 */
const yesNoSchema = enumeratedStringSchema([YesNo.yes, YesNo.no]).describe("DEFAULT, AUTOSELECT, and FORCED, section 4.4.6.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.1");

/**
 * Converts EXT-X-MEDIA's attributes, each optional one absent when not written.
 * Section 4.4.6.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.1
 */
export const extXMediaSchema = attributeListTagSchema({
    TYPE: enumeratedStringSchema([MediaType.audio, MediaType.video, MediaType.subtitles, MediaType.closedCaptions]),
    URI: quotedStringSchema.optional(),
    "GROUP-ID": quotedStringSchema,
    LANGUAGE: quotedStringSchema.optional(),
    "ASSOC-LANGUAGE": quotedStringSchema.optional(),
    NAME: quotedStringSchema,
    "STABLE-RENDITION-ID": quotedStringSchema.pipe(z.string().regex(STABLE_ID_PATTERN)).optional(),
    DEFAULT: yesNoSchema.optional(),
    AUTOSELECT: yesNoSchema.optional(),
    FORCED: yesNoSchema.optional(),
    "INSTREAM-ID": quotedStringSchema.optional(),
    "BIT-DEPTH": decimalIntegerSchema.optional(),
    "SAMPLE-RATE": decimalIntegerSchema.optional(),
    CHARACTERISTICS: quotedStringSchema.transform(parseCharacteristics).optional(),
    CHANNELS: quotedStringSchema.transform(parseChannels).optional(),
}).describe("EXT-X-MEDIA, section 4.4.6.1: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.1");

/** One converted EXT-X-MEDIA tag, describing one Rendition. */
export type Media = Readonly<z.output<typeof extXMediaSchema>>;

const AUDIO_ONLY_ATTRIBUTES = ["BIT-DEPTH", "SAMPLE-RATE", "CHANNELS"] as const;

function isClosedCaptionsChannel(instreamId: string) {
    if (LINE_21_CHANNELS.has(instreamId)) {
        return true;
    }
    const service = SERVICE_PATTERN.exec(instreamId);
    if (service === null) {
        return false;
    }
    const [, numberText] = service;
    assertCondition(numberText !== undefined, `SERVICE_PATTERN matched ${instreamId} without its group.`);
    return Number(numberText) <= SERVICE_NUMBER_MAX;
}

/** Checks the attributes one Rendition's TYPE requires or forbids. */
export function checkMedia(media: Media) {
    const issues: Issue[] = [];
    const instreamId = media["INSTREAM-ID"];
    if (media.TYPE === MediaType.closedCaptions) {
        if (media.URI !== undefined) {
            issues.push({ rule: extXMediaRules.closedCaptionsUri, detail: `NAME="${media.NAME}" is CLOSED-CAPTIONS and has a URI.` });
        }
        const isChannel = instreamId !== undefined && isClosedCaptionsChannel(instreamId);
        if (!isChannel) {
            issues.push({ rule: extXMediaRules.closedCaptionsInstreamId, detail: `NAME="${media.NAME}" has INSTREAM-ID ${String(instreamId)}.` });
        }
    } else if (instreamId !== undefined) {
        if (!INSTREAM_ID_PATTERN.test(instreamId)) {
            issues.push({ rule: extXMediaRules.instreamIdCharacters, detail: `NAME="${media.NAME}" has INSTREAM-ID "${instreamId}".` });
        }
    }
    const isDefault = media.DEFAULT === YesNo.yes;
    const isAutoselectOff = media.AUTOSELECT === YesNo.no;
    const isDefaultNotAutoselected = isDefault && isAutoselectOff;
    if (isDefaultNotAutoselected) {
        issues.push({ rule: extXMediaRules.autoselectWithDefault, detail: `NAME="${media.NAME}" has DEFAULT=YES and AUTOSELECT=NO.` });
    }
    const isForced = media.FORCED !== undefined;
    const isForcedOutsideSubtitles = isForced && media.TYPE !== MediaType.subtitles;
    if (isForcedOutsideSubtitles) {
        issues.push({ rule: extXMediaRules.forcedSubtitlesOnly, detail: `NAME="${media.NAME}" is ${media.TYPE} and has FORCED.` });
    }
    if (media.TYPE !== MediaType.audio) {
        for (const attribute of AUDIO_ONLY_ATTRIBUTES) {
            if (media[attribute] !== undefined) {
                issues.push({ rule: extXMediaRules.audioOnly, detail: `NAME="${media.NAME}" is ${media.TYPE} and has ${attribute}.` });
            }
        }
    }
    return issues;
}
