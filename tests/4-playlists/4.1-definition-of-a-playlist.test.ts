// These tests pin section 4.1: how text splits into lines, which characters a
// line may contain, and how each line classifies as a tag, comment, URI, or
// blank. Invalid cases each break exactly one rule of the section.
import { describe, expect, test } from "vitest";

import {
    checkByteOrderMark,
    checkLine,
    classifyLine,
    definitionRules,
    LineCheckKind,
    LineKind,
    splitLines,
} from "../../src/4-playlists/4.1-definition-of-a-playlist.js";

const BYTE_ORDER_MARK = "﻿";
const LONE_HIGH_SURROGATE = "\uD800";
const NO_BREAK_SPACE = "\u{A0}";
const IDEOGRAPHIC_SPACE = "\u{3000}";
const LINE_SEPARATOR = "\u{2028}";
const DECOMPOSED_E_ACUTE = "é";
const COMPOSED_E_ACUTE = "é";

describe("splitLines", () => {
    const cases = [
        { text: "#EXTM3U\n#EXT-X-VERSION:3\n", lines: ["#EXTM3U", "#EXT-X-VERSION:3"] },
        { text: "#EXTM3U\r\n#EXT-X-VERSION:3\r\n", lines: ["#EXTM3U", "#EXT-X-VERSION:3"] },
        { text: "#EXTM3U\n#EXT-X-ENDLIST", lines: ["#EXTM3U", "#EXT-X-ENDLIST"] },
        { text: "#EXTM3U\n\nsegment.ts\n", lines: ["#EXTM3U", "", "segment.ts"] },
        { text: "a\rb\n", lines: ["a\rb"] },
        { text: "", lines: [] },
    ] as const;

    test.each(cases)("splits $text", ({ text, lines }) => {
        const split = Array.from(splitLines(text));
        expect(split).toEqual(lines);
    });
});

describe("checkLine", () => {
    const valid = [
        "#EXTM3U",
        "#EXTINF:9.009,A title with spaces",
        `#EXT-X-SESSION-DATA:DATA-ID="com.example",VALUE="caf${COMPOSED_E_ACUTE}"`,
        "",
        "https://example.com/segment.ts",
        "a b",
        `a${NO_BREAK_SPACE}b`,
        `caf${COMPOSED_E_ACUTE}`,
    ] as const;
    const invalid = [
        { line: "#EXT\u0000M3U", rule: definitionRules.noControlCharacters },
        { line: "#EXTM3U\u0085", rule: definitionRules.noControlCharacters },
        { line: "a\rb", rule: definitionRules.noControlCharacters },
        { line: "a\tb", rule: definitionRules.noControlCharacters },
        { line: `segment${LONE_HIGH_SURROGATE}.ts`, rule: definitionRules.utf8Encoding },
        { line: `#EXTINF:1,caf${DECOMPOSED_E_ACUTE}`, rule: definitionRules.nfcNormalization },
        { line: " #EXTM3U", rule: definitionRules.noWhitespace },
        { line: "segment.ts ", rule: definitionRules.noWhitespace },
        { line: " ", rule: definitionRules.noWhitespace },
        { line: "a\u007Fb", rule: definitionRules.noControlCharacters },
        { line: "a\u009F", rule: definitionRules.noControlCharacters },
        { line: `caf${COMPOSED_E_ACUTE}\u0001`, rule: definitionRules.noControlCharacters },
        { line: `a${NO_BREAK_SPACE}`, rule: definitionRules.noWhitespace },
        { line: `${IDEOGRAPHIC_SPACE}#EXTM3U`, rule: definitionRules.noWhitespace },
        { line: `a${LINE_SEPARATOR}`, rule: definitionRules.noWhitespace },
        { line: `${LONE_HIGH_SURROGATE} `, rule: definitionRules.utf8Encoding },
        { line: "a\tb ", rule: definitionRules.noControlCharacters },
    ] as const;

    test.each(valid)("accepts %j", (line) => {
        expect(checkLine(line)).toEqual({ kind: LineCheckKind.valid });
    });

    test.each(invalid)("reports $line", ({ line, rule }) => {
        expect(checkLine(line)).toMatchObject({ kind: LineCheckKind.malformed, issue: { rule } });
    });

    test("reports a control character's code point and column", () => {
        const detail = "U+0000 at column 5.";
        expect(checkLine("#EXT\u0000M3U")).toMatchObject({ issue: { detail } });
    });
});

describe("checkByteOrderMark", () => {
    test("accepts a first line without a byte order mark", () => {
        expect(checkByteOrderMark("#EXTM3U")).toEqual({ kind: LineCheckKind.valid });
    });

    test("reports a first line starting with a byte order mark", () => {
        const outcome = checkByteOrderMark(`${BYTE_ORDER_MARK}#EXTM3U`);
        expect(outcome).toMatchObject({
            kind: LineCheckKind.malformed,
            issue: { rule: definitionRules.noByteOrderMark },
        });
    });
});

describe("classifyLine", () => {
    const cases = [
        { line: "#EXTM3U", classified: { kind: LineKind.tag, name: "EXTM3U" } },
        { line: "#EXT-X-VERSION:3", classified: { kind: LineKind.tag, name: "EXT-X-VERSION", value: "3" } },
        { line: "#EXTINF:9.009,", classified: { kind: LineKind.tag, name: "EXTINF", value: "9.009," } },
        { line: "#EXT-X-DEFINE:", classified: { kind: LineKind.tag, name: "EXT-X-DEFINE", value: "" } },
        { line: "# A comment", classified: { kind: LineKind.comment } },
        { line: "#ext-x-version:3", classified: { kind: LineKind.comment } },
        { line: "#EX", classified: { kind: LineKind.comment } },
        { line: "segment.ts", classified: { kind: LineKind.uri, uri: "segment.ts" } },
        { line: "", classified: { kind: LineKind.blank } },
    ] as const;

    test.each(cases)("classifies $line", ({ line, classified }) => {
        expect(classifyLine(line)).toEqual(classified);
    });
});
