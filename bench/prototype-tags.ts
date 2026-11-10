// Prototype tag conversions in the shape the library's section schemas take: a
// raw tag (an unparsed value, or attributes as unparsed strings) converted to a
// typed value. Each tag has a zod schema and a hand-written equivalent, so the
// benchmark measures zod's cost against a floor doing the same checks.
import { z } from "zod";

const DECIMAL_INTEGER_PATTERN = /^[0-9]{1,20}$/;
const DECIMAL_FLOATING_POINT_PATTERN = /^[0-9]+(?:\.[0-9]+)?$/;
const QUOTED_STRING_PATTERN = /^"[^"\r\n]*"$/;
const RESOLUTION_PATTERN = /^[0-9]{1,20}x[0-9]{1,20}$/;
const EXTINF_PATTERN = /^[0-9]+(?:\.[0-9]+)?,/;
const ISO_DATE_TIME_PATTERN =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const ENUMERATED_YES = "YES";
const RESOLUTION_SEPARATOR = "x";
const LIST_SEPARATOR = ",";
const EXTINF_SEPARATOR = ",";

// Section 4.2 bounds a decimal-integer to the range 0 to 2^64-1.
const DECIMAL_INTEGER_MAX = 18446744073709551615n;

export type RawAttributes = Readonly<Record<string, string>>;

export const ConversionKind = { converted: "converted", rejected: "rejected" } as const;
export type ConversionKind = (typeof ConversionKind)[keyof typeof ConversionKind];

type ConversionPayloads<T> = {
    [ConversionKind.converted]: { readonly value: T };
    [ConversionKind.rejected]: Record<never, never>;
};
type ConversionMember<T, K extends ConversionKind> = { readonly kind: K } & ConversionPayloads<T>[K];
export type Conversion<T> = { [K in ConversionKind]: ConversionMember<T, K> }[ConversionKind];

function toBigInt(value: string) {
    return BigInt(value);
}

function unquote(value: string) {
    return value.slice(1, value.length - 1);
}

function toResolution(value: string) {
    const separatorIndex = value.indexOf(RESOLUTION_SEPARATOR);
    const width = BigInt(value.slice(0, separatorIndex));
    const height = BigInt(value.slice(separatorIndex + 1));
    return Object.freeze({ width, height });
}

function toCodecList(value: string) {
    const unquoted = unquote(value);
    const codecs = unquoted.split(LIST_SEPARATOR);
    return Object.freeze(codecs);
}

function toExtinf(value: string) {
    const separatorIndex = value.indexOf(EXTINF_SEPARATOR);
    const duration = Number(value.slice(0, separatorIndex));
    const title = value.slice(separatorIndex + 1);
    return Object.freeze({ duration, title });
}

const decimalIntegerSchema = z
    .string()
    .regex(DECIMAL_INTEGER_PATTERN)
    .transform(toBigInt)
    .pipe(z.bigint().lte(DECIMAL_INTEGER_MAX));
const decimalFloatingPointSchema = z.string().regex(DECIMAL_FLOATING_POINT_PATTERN).transform(Number);
const quotedStringSchema = z.string().regex(QUOTED_STRING_PATTERN).transform(unquote);
const resolutionSchema = z.string().regex(RESOLUTION_PATTERN).transform(toResolution);
const codecListSchema = z.string().regex(QUOTED_STRING_PATTERN).transform(toCodecList);
const yesSchema = z.literal(ENUMERATED_YES);

export const extinfSchema = z.string().regex(EXTINF_PATTERN).transform(toExtinf);

export const programDateTimeSchema = z.iso.datetime({ offset: true });

export const streamInfSchema = z
    .object({
        BANDWIDTH: decimalIntegerSchema,
        "AVERAGE-BANDWIDTH": decimalIntegerSchema.optional(),
        CODECS: codecListSchema.optional(),
        RESOLUTION: resolutionSchema.optional(),
        "FRAME-RATE": decimalFloatingPointSchema.optional(),
    })
    .readonly();

export const partSchema = z
    .object({
        DURATION: decimalFloatingPointSchema,
        URI: quotedStringSchema,
        INDEPENDENT: yesSchema.optional(),
        BYTERANGE: quotedStringSchema.optional(),
        GAP: yesSchema.optional(),
    })
    .readonly();

function isDecimalInteger(value: string) {
    const isWellFormed = DECIMAL_INTEGER_PATTERN.test(value);
    if (isWellFormed) {
        return BigInt(value) <= DECIMAL_INTEGER_MAX;
    }
    return false;
}

export function convertExtinf(value: string) {
    if (EXTINF_PATTERN.test(value)) {
        const converted: Conversion<ReturnType<typeof toExtinf>> = {
            kind: ConversionKind.converted,
            value: toExtinf(value),
        };
        return converted;
    }
    const rejected: Conversion<ReturnType<typeof toExtinf>> = { kind: ConversionKind.rejected };
    return rejected;
}

export function convertProgramDateTime(value: string) {
    if (ISO_DATE_TIME_PATTERN.test(value)) {
        const converted: Conversion<string> = { kind: ConversionKind.converted, value };
        return converted;
    }
    const rejected: Conversion<string> = { kind: ConversionKind.rejected };
    return rejected;
}

/** Converts a raw EXT-X-STREAM-INF attribute map, checking the same rules as streamInfSchema. */
export function convertStreamInf(attributes: RawAttributes) {
    type StreamInf = z.output<typeof streamInfSchema>;
    const rejected: Conversion<StreamInf> = { kind: ConversionKind.rejected };
    const bandwidth = attributes["BANDWIDTH"];
    if (bandwidth === undefined) {
        return rejected;
    }
    if (!isDecimalInteger(bandwidth)) {
        return rejected;
    }
    const value: { -readonly [K in keyof StreamInf]: StreamInf[K] } = { BANDWIDTH: BigInt(bandwidth) };
    const averageBandwidth = attributes["AVERAGE-BANDWIDTH"];
    if (averageBandwidth !== undefined) {
        if (!isDecimalInteger(averageBandwidth)) {
            return rejected;
        }
        value["AVERAGE-BANDWIDTH"] = BigInt(averageBandwidth);
    }
    const codecs = attributes["CODECS"];
    if (codecs !== undefined) {
        if (!QUOTED_STRING_PATTERN.test(codecs)) {
            return rejected;
        }
        value.CODECS = toCodecList(codecs);
    }
    const resolution = attributes["RESOLUTION"];
    if (resolution !== undefined) {
        if (!RESOLUTION_PATTERN.test(resolution)) {
            return rejected;
        }
        value.RESOLUTION = toResolution(resolution);
    }
    const frameRate = attributes["FRAME-RATE"];
    if (frameRate !== undefined) {
        if (!DECIMAL_FLOATING_POINT_PATTERN.test(frameRate)) {
            return rejected;
        }
        value["FRAME-RATE"] = Number(frameRate);
    }
    const converted: Conversion<StreamInf> = { kind: ConversionKind.converted, value: Object.freeze(value) };
    return converted;
}

/** Converts a raw EXT-X-PART attribute map, checking the same rules as partSchema. */
export function convertPart(attributes: RawAttributes) {
    type Part = z.output<typeof partSchema>;
    const rejected: Conversion<Part> = { kind: ConversionKind.rejected };
    const duration = attributes["DURATION"];
    const uri = attributes["URI"];
    if (duration === undefined) {
        return rejected;
    }
    if (uri === undefined) {
        return rejected;
    }
    const isDurationValid = DECIMAL_FLOATING_POINT_PATTERN.test(duration);
    const isUriValid = QUOTED_STRING_PATTERN.test(uri);
    const areRequiredValid = isDurationValid && isUriValid;
    if (!areRequiredValid) {
        return rejected;
    }
    const value: { -readonly [K in keyof Part]: Part[K] } = { DURATION: Number(duration), URI: unquote(uri) };
    const independent = attributes["INDEPENDENT"];
    if (independent !== undefined) {
        if (independent !== ENUMERATED_YES) {
            return rejected;
        }
        value.INDEPENDENT = ENUMERATED_YES;
    }
    const byteRange = attributes["BYTERANGE"];
    if (byteRange !== undefined) {
        if (!QUOTED_STRING_PATTERN.test(byteRange)) {
            return rejected;
        }
        value.BYTERANGE = unquote(byteRange);
    }
    const gap = attributes["GAP"];
    if (gap !== undefined) {
        if (gap !== ENUMERATED_YES) {
            return rejected;
        }
        value.GAP = ENUMERATED_YES;
    }
    const converted: Conversion<Part> = { kind: ConversionKind.converted, value: Object.freeze(value) };
    return converted;
}
