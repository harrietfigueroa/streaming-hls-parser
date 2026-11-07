// These tests pin section 4.2: the attribute-list grammar, and each attribute
// value type's conversion. Every case is a literal from or derived from the
// spec's grammar, with the negative space covering each way a value can break it.
import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
    AttributeListKind,
    attributeListRules,
    decimalFloatingPointSchema,
    decimalIntegerSchema,
    decimalResolutionSchema,
    enumeratedStringListSchema,
    enumeratedStringSchema,
    hexadecimalSequenceSchema,
    parseAttributeList,
    possiblyEmptyQuotedStringSchema,
    quotedStringSchema,
    signedDecimalFloatingPointSchema,
} from "../../src/4-playlists/4.2-attribute-lists.js";

const DECIMAL_INTEGER_MAX = 18446744073709551615n;

const HdcpLevel = { type0: "TYPE-0", type1: "TYPE-1", none: "NONE" } as const;
const hdcpLevels = [HdcpLevel.type0, HdcpLevel.type1, HdcpLevel.none] as const;
const hdcpLevelSchema = enumeratedStringSchema(hdcpLevels);
const hdcpLevelListSchema = enumeratedStringListSchema(hdcpLevels);

const validAttributeLists = [
    { text: "BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000", attributes: { BANDWIDTH: "1280000", "AVERAGE-BANDWIDTH": "1000000" } },
    { text: 'CODECS="mp4a.40.2,avc1.4d401e",BANDWIDTH=1', attributes: { CODECS: '"mp4a.40.2,avc1.4d401e"', BANDWIDTH: "1" } },
    { text: 'URI=""', attributes: { URI: '""' } },
    { text: "RESOLUTION=1920x1080", attributes: { RESOLUTION: "1920x1080" } },
    { text: "", attributes: {} },
] as const;

const malformedAttributeLists = [
    { text: "bandwidth=1", rule: attributeListRules.attributeNameCharacters },
    { text: "BANDWIDTH =1", rule: attributeListRules.attributeNameCharacters },
    { text: "BANDWIDTH= 1", rule: attributeListRules.noWhitespace },
    { text: "BANDWIDTH=1 ", rule: attributeListRules.noWhitespace },
    { text: "BANDWIDTH=1, CODECS=2", rule: attributeListRules.attributeNameCharacters },
    { text: "BANDWIDTH=1,BANDWIDTH=2", rule: attributeListRules.uniqueAttributeNames },
    { text: "BANDWIDTH=1,", rule: attributeListRules.attributeListSyntax },
    { text: "BANDWIDTH", rule: attributeListRules.attributeListSyntax },
    { text: "=1", rule: attributeListRules.attributeListSyntax },
    { text: 'CODECS="mp4a', rule: attributeListRules.attributeListSyntax },
    { text: 'CODECS="mp4a"x', rule: attributeListRules.attributeListSyntax },
    { text: 'CODECS=mp4a"', rule: attributeListRules.attributeListSyntax },
] as const;

describe("parseAttributeList", () => {
    test.each(validAttributeLists)("parses $text", ({ text, attributes }) => {
        const outcome = parseAttributeList(text);
        expect(outcome).toEqual({ kind: AttributeListKind.parsed, attributes });
    });

    test.each(malformedAttributeLists)("reports $text as malformed", ({ text, rule }) => {
        const outcome = parseAttributeList(text);
        expect(outcome).toMatchObject({ kind: AttributeListKind.malformed, issue: { rule } });
    });

    test("freezes the parsed attributes", () => {
        const outcome = parseAttributeList("BANDWIDTH=1");
        expect(outcome).toMatchObject({ kind: AttributeListKind.parsed });
        if (outcome.kind === AttributeListKind.parsed) {
            expect(Object.isFrozen(outcome.attributes)).toBe(true);
        }
    });
});

type ValueCase = { readonly text: string; readonly value: unknown };

function expectConverted(schema: z.ZodType, { text, value }: ValueCase) {
    const result = schema.safeParse(text);
    expect(result).toEqual({ success: true, data: value });
}

function expectRejected(schema: z.ZodType, text: string) {
    const result = schema.safeParse(text);
    expect(result.success).toBe(false);
}

describe("decimal-integer", () => {
    const valid: readonly ValueCase[] = [
        { text: "0", value: 0n },
        { text: "1280000", value: 1280000n },
        { text: "18446744073709551615", value: DECIMAL_INTEGER_MAX },
    ];
    const invalid = ["", "-1", "1.0", "0x1", " 1", "18446744073709551616", "000000000000000000001"] as const;

    test.each(valid)("converts $text", (valueCase) => {
        expectConverted(decimalIntegerSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(decimalIntegerSchema, text);
    });
});

describe("hexadecimal-sequence", () => {
    const valid: readonly ValueCase[] = [
        { text: "0x1A2B", value: "0x1A2B" },
        { text: "0X0F", value: "0X0F" },
    ];
    const invalid = ["", "0x", "1A2B", "0x1a2b", "0xG1"] as const;

    test.each(valid)("keeps $text as written", (valueCase) => {
        expectConverted(hexadecimalSequenceSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(hexadecimalSequenceSchema, text);
    });
});

describe("decimal-floating-point", () => {
    const valid: readonly ValueCase[] = [
        { text: "9.009", value: 9.009 },
        { text: "10", value: 10 },
        { text: "0.5", value: 0.5 },
    ];
    const invalid = ["", "-1.0", "1e3", ".", "1.2.3", "+1"] as const;

    test.each(valid)("converts $text", (valueCase) => {
        expectConverted(decimalFloatingPointSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(decimalFloatingPointSchema, text);
    });
});

describe("signed-decimal-floating-point", () => {
    const valid: readonly ValueCase[] = [
        { text: "-1.5", value: -1.5 },
        { text: "2", value: 2 },
    ];
    const invalid = ["", "--1", "1-", "-", "+1"] as const;

    test.each(valid)("converts $text", (valueCase) => {
        expectConverted(signedDecimalFloatingPointSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(signedDecimalFloatingPointSchema, text);
    });
});

describe("quoted-string", () => {
    const valid: readonly ValueCase[] = [
        { text: '"main"', value: "main" },
        { text: '"a,b c"', value: "a,b c" },
    ];
    const invalid = ["main", '""', '"a"b"', '"unterminated', '"a\rb"'] as const;

    test.each(valid)("unquotes $text", (valueCase) => {
        expectConverted(quotedStringSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(quotedStringSchema, text);
    });
    test("accepts an empty value where the attribute allows it", () => {
        expectConverted(possiblyEmptyQuotedStringSchema, { text: '""', value: "" });
    });
});

describe("enumerated-string", () => {
    test("converts a recognized value", () => {
        expectConverted(hdcpLevelSchema, { text: HdcpLevel.type1, value: HdcpLevel.type1 });
    });
    test("rejects an unrecognized value", () => {
        expectRejected(hdcpLevelSchema, "TYPE-2");
    });
});

describe("enumerated-string-list", () => {
    const valid: readonly ValueCase[] = [
        { text: '"TYPE-0,NONE"', value: [HdcpLevel.type0, HdcpLevel.none] },
        { text: '"TYPE-0,TYPE-9"', value: [HdcpLevel.type0] },
    ];
    const invalid = ["TYPE-0", '""', '"TYPE-0,"', '"TYPE-0, NONE"'] as const;

    test.each(valid)("keeps the recognized members of $text", (valueCase) => {
        expectConverted(hdcpLevelListSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(hdcpLevelListSchema, text);
    });
});

describe("decimal-resolution", () => {
    const valid: readonly ValueCase[] = [{ text: "1920x1080", value: { width: 1920n, height: 1080n } }];
    const invalid = ["1920X1080", "1920x", "x1080", "1920*1080", "-1x1"] as const;

    test.each(valid)("converts $text", (valueCase) => {
        expectConverted(decimalResolutionSchema, valueCase);
    });
    test.each(invalid)("rejects %j", (text) => {
        expectRejected(decimalResolutionSchema, text);
    });
});

describe("compilation", () => {
    const schemas = {
        decimalIntegerSchema,
        hexadecimalSequenceSchema,
        decimalFloatingPointSchema,
        signedDecimalFloatingPointSchema,
        quotedStringSchema,
        possiblyEmptyQuotedStringSchema,
        hdcpLevelSchema,
        hdcpLevelListSchema,
        decimalResolutionSchema,
    } as const;

    test.each(Object.entries(schemas))("%s compiles without falling back to the runtime parser", (_name, schema) => {
        expect(() => z.compile(schema, { strict: true })).not.toThrow();
    });
});
