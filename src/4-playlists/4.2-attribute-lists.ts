// Section 4.2, Attribute Lists. This module is pure: it splits an
// attribute-list into raw AttributeName/AttributeValue pairs, and defines one
// schema per AttributeValue type converting the raw text to its typed value.
import { z } from "zod";

import { AssertionError, assertCondition } from "../library/assert.js";
import { type Issue, type Rule, Severity } from "../library/rule.js";
import { ignoreReasons } from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";

const SECTION = "4.2";

export const attributeListRules = {
    attributeListSyntax: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An attribute-list is a comma-separated list of AttributeName=AttributeValue pairs.",
    },
    attributeNameCharacters: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An AttributeName contains only the characters [A-Z], [0-9], and '-'.",
    },
    noWhitespace: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An attribute-list contains no whitespace outside quoted-string values.",
    },
    uniqueAttributeNames: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A given AttributeName appears at most once in an attribute-list.",
    },
} as const satisfies Record<string, Rule>;

export const AttributeListKind = { parsed: "parsed", malformed: "malformed" } as const;
export type AttributeListKind = (typeof AttributeListKind)[keyof typeof AttributeListKind];

type AttributeListPayloads = {
    [AttributeListKind.parsed]: { readonly attributes: Readonly<Record<string, string>> };
    [AttributeListKind.malformed]: { readonly issue: Issue };
};
type AttributeListMember<K extends AttributeListKind> = { readonly kind: K } & AttributeListPayloads[K];
export type AttributeList = { [K in AttributeListKind]: AttributeListMember<K> }[AttributeListKind];

const ScanKind = { scanned: "scanned", malformed: "malformed" } as const;
type ScanKind = (typeof ScanKind)[keyof typeof ScanKind];

type ScanPayloads = {
    [ScanKind.scanned]: { readonly name: string; readonly value: string; readonly end: number };
    [ScanKind.malformed]: { readonly issue: Issue };
};
type ScanMember<K extends ScanKind> = { readonly kind: K } & ScanPayloads[K];
type Scan = { [K in ScanKind]: ScanMember<K> }[ScanKind];

const ATTRIBUTE_NAME_PATTERN = /^[A-Z0-9-]+$/;
const WHITESPACE_PATTERN = /\s/;
const NAME_VALUE_SEPARATOR = "=";
const PAIR_SEPARATOR = ",";
const QUOTE = '"';
const NOT_FOUND = -1;

function malformedScan(rule: Rule, detail: string) {
    const malformed: Scan = { kind: ScanKind.malformed, issue: { rule, detail } };
    return malformed;
}

/** Scans the one AttributeName=AttributeValue pair starting at `start`, ending at its value's last character. */
function scanAttribute(text: string, start: number) {
    assertCondition(start < text.length, `Scan start ${start} is not before the text length ${text.length}.`);
    const separatorIndex = text.indexOf(NAME_VALUE_SEPARATOR, start);
    if (separatorIndex === NOT_FOUND) {
        return malformedScan(attributeListRules.attributeListSyntax, `No '=' after offset ${start}.`);
    }
    const name = text.slice(start, separatorIndex);
    if (name.length === 0) {
        return malformedScan(attributeListRules.attributeListSyntax, `Empty AttributeName at offset ${start}.`);
    }
    if (!ATTRIBUTE_NAME_PATTERN.test(name)) {
        return malformedScan(attributeListRules.attributeNameCharacters, `AttributeName ${JSON.stringify(name)}.`);
    }
    const valueStart = separatorIndex + 1;
    const isQuoted = text[valueStart] === QUOTE;
    let end = text.indexOf(PAIR_SEPARATOR, valueStart);
    if (isQuoted) {
        const closingQuoteIndex = text.indexOf(QUOTE, valueStart + 1);
        if (closingQuoteIndex === NOT_FOUND) {
            return malformedScan(attributeListRules.attributeListSyntax, `Unterminated quoted-string for ${name}.`);
        }
        end = closingQuoteIndex + 1;
    } else if (end === NOT_FOUND) {
        end = text.length;
    }
    const value = text.slice(valueStart, end);
    if (value.length === 0) {
        return malformedScan(attributeListRules.attributeListSyntax, `Empty AttributeValue for ${name}.`);
    }
    if (isQuoted) {
        const scanned: Scan = { kind: ScanKind.scanned, name, value, end };
        return scanned;
    }
    if (WHITESPACE_PATTERN.test(value)) {
        return malformedScan(attributeListRules.noWhitespace, `AttributeValue ${JSON.stringify(value)} for ${name}.`);
    }
    if (value.includes(QUOTE)) {
        return malformedScan(attributeListRules.attributeListSyntax, `Stray '"' in the value for ${name}.`);
    }
    const scanned: Scan = { kind: ScanKind.scanned, name, value, end };
    return scanned;
}

function malformedAttributeList(issue: Issue) {
    const malformed: AttributeList = { kind: AttributeListKind.malformed, issue };
    return malformed;
}

/**
 * Splits an attribute-list into its AttributeName to raw AttributeValue pairs, in which a
 * quoted-string keeps its quotes. Returns the first rule the text breaks when it is not a
 * well-formed attribute-list.
 */
export function parseAttributeList(text: string) {
    const attributes: Record<string, string> = {};
    if (text.length === 0) {
        const empty: AttributeList = { kind: AttributeListKind.parsed, attributes: Object.freeze(attributes) };
        return empty;
    }
    // Every pair advances pairStart past at least "A=1,", so the loop runs at most once per character.
    for (let pairStart = 0; pairStart < text.length; ) {
        const scan = scanAttribute(text, pairStart);
        if (scan.kind === ScanKind.malformed) {
            return malformedAttributeList(scan.issue);
        }
        if (Object.hasOwn(attributes, scan.name)) {
            const detail = `AttributeName ${scan.name} repeats.`;
            return malformedAttributeList({ rule: attributeListRules.uniqueAttributeNames, detail });
        }
        attributes[scan.name] = scan.value;
        if (scan.end === text.length) {
            const parsed: AttributeList = { kind: AttributeListKind.parsed, attributes: Object.freeze(attributes) };
            return parsed;
        }
        if (text[scan.end] !== PAIR_SEPARATOR) {
            const detail = `Text after the value for ${scan.name}.`;
            return malformedAttributeList({ rule: attributeListRules.attributeListSyntax, detail });
        }
        pairStart = scan.end + 1;
        if (pairStart === text.length) {
            return malformedAttributeList({ rule: attributeListRules.attributeListSyntax, detail: "Trailing ','." });
        }
    }
    throw new AssertionError(`Attribute-list scan ended without a result on ${JSON.stringify(text)}.`);
}

// Section 4.2 bounds a decimal-integer to the range 0 to 2^64-1.
const DECIMAL_INTEGER_MAX = 18446744073709551615n;
const DECIMAL_INTEGER_PATTERN = /^[0-9]{1,20}$/;
const HEXADECIMAL_SEQUENCE_PATTERN = /^0[xX][0-9A-F]+$/;
const DECIMAL_FLOATING_POINT_PATTERN = /^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/;
const SIGNED_DECIMAL_FLOATING_POINT_PATTERN = /^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/;
const QUOTED_STRING_PATTERN = /^"[^"\r\n]+"$/;
const POSSIBLY_EMPTY_QUOTED_STRING_PATTERN = /^"[^"\r\n]*"$/;
const ENUMERATED_STRING_LIST_PATTERN = /^"[^",\s]+(?:,[^",\s]+)*"$/;
const DECIMAL_RESOLUTION_PATTERN = /^[0-9]{1,20}x[0-9]{1,20}$/;
const RESOLUTION_SEPARATOR = "x";
const LIST_SEPARATOR = ",";

function toBigInt(value: string) {
    return BigInt(value);
}

function toNumber(value: string) {
    return Number(value);
}

function unquote(value: string) {
    return value.slice(1, value.length - 1);
}

function toResolution(value: string) {
    const separatorIndex = value.indexOf(RESOLUTION_SEPARATOR);
    const width = BigInt(value.slice(0, separatorIndex));
    const height = BigInt(value.slice(separatorIndex + 1));
    return { width, height };
}

const boundedBigIntSchema = z.bigint().lte(DECIMAL_INTEGER_MAX);

/** Converts a decimal-integer (up to 20 digits, at most 2^64-1) to a bigint. */
export const decimalIntegerSchema = z
    .string()
    .regex(DECIMAL_INTEGER_PATTERN)
    .transform(toBigInt)
    .pipe(boundedBigIntSchema);

/** Validates a hexadecimal-sequence (`0x` or `0X`, then uppercase hex digits), kept as written per decision 12. */
export const hexadecimalSequenceSchema = z.string().regex(HEXADECIMAL_SEQUENCE_PATTERN);

/** Converts a decimal-floating-point (non-negative, decimal positional notation) to a number. */
export const decimalFloatingPointSchema = z.string().regex(DECIMAL_FLOATING_POINT_PATTERN).transform(toNumber);

/** Converts a signed-decimal-floating-point (decimal positional notation, optionally negative) to a number. */
export const signedDecimalFloatingPointSchema = z
    .string()
    .regex(SIGNED_DECIMAL_FLOATING_POINT_PATTERN)
    .transform(toNumber);

/** Unquotes a non-empty quoted-string. */
export const quotedStringSchema = z.string().regex(QUOTED_STRING_PATTERN).transform(unquote);

/** Unquotes a quoted-string, for the attributes whose definitions allow an empty value. */
export const possiblyEmptyQuotedStringSchema = z.string().regex(POSSIBLY_EMPTY_QUOTED_STRING_PATTERN).transform(unquote);

/** Converts a decimal-resolution (`<width>x<height>`, each a decimal-integer) to a frozen width and height. */
export const decimalResolutionSchema = z
    .string()
    .regex(DECIMAL_RESOLUTION_PATTERN)
    .transform(toResolution)
    .pipe(z.object({ width: boundedBigIntSchema, height: boundedBigIntSchema }).readonly());

type EnumeratedValues = readonly [string, ...string[]];

/** Validates an enumerated-string against the values its AttributeName defines. */
export function enumeratedStringSchema<const Values extends EnumeratedValues>(values: Values) {
    return z.enum(values);
}

/**
 * Converts an enumerated-string-list (a quoted-string of comma-separated enumerated-strings) to a
 * frozen array. Members outside `values` are dropped, as section 4.2 requires for forward
 * compatibility.
 */
export function enumeratedStringListSchema<const Values extends EnumeratedValues>(values: Values) {
    const recognized: ReadonlySet<string> = new Set(values);
    function isRecognized(member: string): member is Values[number] {
        return recognized.has(member);
    }
    function toRecognizedMembers(value: string) {
        const unquoted = unquote(value);
        const members = unquoted.split(LIST_SEPARATOR);
        const recognizedMembers: Values[number][] = [];
        for (const member of members) {
            if (isRecognized(member)) {
                recognizedMembers.push(member);
            }
        }
        return Object.freeze(recognizedMembers);
    }
    return z.string().regex(ENUMERATED_STRING_LIST_PATTERN).transform(toRecognizedMembers);
}

const REQUIRED_ATTRIBUTE_PREFIX = "REQ-";

type AttributesShape = Readonly<Record<string, z.ZodType>>;

/**
 * Converts an attribute-list tag's raw attributes by `shape`, its attribute table. Unrecognized
 * attributes are kept as written in a frozen `ignored` array, absent when there are none, as
 * section 6.3.1 requires. An unrecognized attribute starting with `REQ-` reports a custom issue
 * whose `params.ignoreReason` is 6.3.1's reason to ignore the tag whole.
 */
export function attributeListTagSchema<const Shape extends AttributesShape>(shape: Shape) {
    const recognizedNames: ReadonlySet<string> = new Set(Object.keys(shape));
    function splitUnrecognized(attributes: Readonly<Record<string, string>>, context: z.core.$RefinementCtx) {
        const recognized: Record<string, string> = {};
        const ignored: string[] = [];
        for (const [name, value] of Object.entries(attributes)) {
            if (recognizedNames.has(name)) {
                recognized[name] = value;
                continue;
            }
            if (name.startsWith(REQUIRED_ATTRIBUTE_PREFIX)) {
                const params = { ignoreReason: ignoreReasons.unrecognizedRequiredAttribute };
                context.addIssue({ code: "custom", message: `Unrecognized attribute ${name}.`, params });
            }
            ignored.push(`${name}${NAME_VALUE_SEPARATOR}${value}`);
        }
        if (ignored.length === 0) {
            return recognized;
        }
        return { ...recognized, ignored: Object.freeze(ignored) };
    }
    const tagSchema = z.object({ ...shape, ignored: z.array(z.string()).readonly().optional() }).readonly();
    return z.preprocess(splitUnrecognized, tagSchema);
}
