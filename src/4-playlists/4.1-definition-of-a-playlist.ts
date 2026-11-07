// Section 4.1, Definition of a Playlist. This module is pure: it splits text
// into lines, checks each line against the section's character rules, and
// classifies each line as a tag, comment, URI, or blank.
import { assertCondition } from "../library/assert.js";
import { type Issue, type Rule, Severity } from "../library/rule.js";

const SECTION = "4.1";

export const definitionRules = {
    utf8Encoding: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Playlist files are encoded in UTF-8.",
    },
    noByteOrderMark: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Playlist files contain no Byte Order Mark.",
    },
    noControlCharacters: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Playlist files contain no control characters other than the CR and LF of line terminators.",
    },
    nfcNormalization: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "All character sequences are normalized to Unicode normalization form NFC.",
    },
    noWhitespace: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Whitespace is not present except in elements that explicitly allow it.",
    },
} as const satisfies Record<string, Rule>;

const LINE_FEED = "\n";
const CARRIAGE_RETURN = "\r";
const NOT_FOUND = -1;

/** Yields each line of `text` without its terminator, which is LF or CR LF; a final empty line is not yielded. */
export function* splitLines(text: string) {
    let lineStart = 0;
    // Each iteration consumes at least the LF it found, so the loop runs at most once per character.
    for (let lineCount = 0; lineStart < text.length; lineCount += 1) {
        assertCondition(lineCount <= text.length, `Line count ${lineCount} exceeds the text length ${text.length}.`);
        const lineFeedIndex = text.indexOf(LINE_FEED, lineStart);
        if (lineFeedIndex === NOT_FOUND) {
            yield text.slice(lineStart);
            return;
        }
        let lineEnd = lineFeedIndex;
        const isCarriageReturnTerminated = lineFeedIndex > lineStart && text[lineFeedIndex - 1] === CARRIAGE_RETURN;
        if (isCarriageReturnTerminated) {
            lineEnd = lineFeedIndex - 1;
        }
        yield text.slice(lineStart, lineEnd);
        lineStart = lineFeedIndex + 1;
    }
}

export const LineCheckKind = { valid: "valid", malformed: "malformed" } as const;
export type LineCheckKind = (typeof LineCheckKind)[keyof typeof LineCheckKind];

type LineCheckPayloads = {
    [LineCheckKind.valid]: Record<never, never>;
    [LineCheckKind.malformed]: { readonly issue: Issue };
};
type LineCheckMember<K extends LineCheckKind> = { readonly kind: K } & LineCheckPayloads[K];
export type LineCheck = { [K in LineCheckKind]: LineCheckMember<K> }[LineCheckKind];

// Section 4.1 forbids U+0000 to U+001F and U+007F to U+009F. CR and LF are allowed only
// as line terminators, which splitLines has already removed.
const C0_CONTROL_LAST = 0x1f;
const C1_CONTROL_FIRST = 0x7f;
const C1_CONTROL_LAST = 0x9f;
const ASCII_LAST = 0x7f;
const BYTE_ORDER_MARK = "﻿";
const NFC = "NFC";
const EDGE_WHITESPACE_PATTERN = /^\s|\s$/;
const HEXADECIMAL_RADIX = 16;
// A code point is written U+XXXX, with at least four hex digits.
const CODE_POINT_DIGIT_COUNT_MIN = 4;
const CODE_POINT_PAD = "0";

function formatCodePoint(code: number) {
    const hexadecimal = code.toString(HEXADECIMAL_RADIX).toUpperCase();
    return `U+${hexadecimal.padStart(CODE_POINT_DIGIT_COUNT_MIN, CODE_POINT_PAD)}`;
}

function malformedLine(rule: Rule, detail: string) {
    const malformed: LineCheck = { kind: LineCheckKind.malformed, issue: { rule, detail } };
    return malformed;
}

function isControlCharacter(code: number) {
    const isC0 = code <= C0_CONTROL_LAST;
    const isC1 = code >= C1_CONTROL_FIRST && code <= C1_CONTROL_LAST;
    return isC0 || isC1;
}

/** Checks one line, without its terminator, against section 4.1's character rules. */
export function checkLine(line: string) {
    let isAscii = true;
    for (let index = 0; index < line.length; index += 1) {
        const code = line.charCodeAt(index);
        if (isControlCharacter(code)) {
            const detail = `${formatCodePoint(code)} at column ${index + 1}.`;
            return malformedLine(definitionRules.noControlCharacters, detail);
        }
        if (code > ASCII_LAST) {
            isAscii = false;
        }
    }
    // An ASCII line is valid UTF-16 and already in NFC, so only non-ASCII lines pay for these checks.
    if (!isAscii) {
        if (!line.isWellFormed()) {
            return malformedLine(definitionRules.utf8Encoding, "The line contains a lone surrogate.");
        }
        if (line !== line.normalize(NFC)) {
            return malformedLine(definitionRules.nfcNormalization, "The line is not in normalization form NFC.");
        }
    }
    if (EDGE_WHITESPACE_PATTERN.test(line)) {
        return malformedLine(definitionRules.noWhitespace, "The line starts or ends with whitespace.");
    }
    const valid: LineCheck = { kind: LineCheckKind.valid };
    return valid;
}

/** Checks a playlist's first line for a leading Byte Order Mark. */
export function checkByteOrderMark(firstLine: string) {
    if (firstLine.startsWith(BYTE_ORDER_MARK)) {
        return malformedLine(definitionRules.noByteOrderMark, "The playlist starts with U+FEFF.");
    }
    const valid: LineCheck = { kind: LineCheckKind.valid };
    return valid;
}

export const LineKind = { tag: "tag", comment: "comment", uri: "uri", blank: "blank" } as const;
export type LineKind = (typeof LineKind)[keyof typeof LineKind];

type LinePayloads = {
    /** `value` is the text after the first ':', and is absent when the line has no ':'. */
    [LineKind.tag]: { readonly name: string; readonly value?: string };
    [LineKind.comment]: Record<never, never>;
    [LineKind.uri]: { readonly uri: string };
    [LineKind.blank]: Record<never, never>;
};
type LineMember<K extends LineKind> = { readonly kind: K } & LinePayloads[K];
export type Line = { [K in LineKind]: LineMember<K> }[LineKind];

const TAG_PREFIX = "#EXT";
const COMMENT_PREFIX = "#";
const TAG_VALUE_SEPARATOR = ":";

/** Classifies a line: tags begin with `#EXT` (case-sensitive), other `#` lines are comments, and the rest are URIs or blank. */
export function classifyLine(line: string) {
    if (line.length === 0) {
        const blank: Line = { kind: LineKind.blank };
        return blank;
    }
    if (line.startsWith(TAG_PREFIX)) {
        const separatorIndex = line.indexOf(TAG_VALUE_SEPARATOR);
        if (separatorIndex === NOT_FOUND) {
            const flag: Line = { kind: LineKind.tag, name: line.slice(COMMENT_PREFIX.length) };
            return flag;
        }
        const name = line.slice(COMMENT_PREFIX.length, separatorIndex);
        const value = line.slice(separatorIndex + 1);
        const tag: Line = { kind: LineKind.tag, name, value };
        return tag;
    }
    if (line.startsWith(COMMENT_PREFIX)) {
        const comment: Line = { kind: LineKind.comment };
        return comment;
    }
    const uri: Line = { kind: LineKind.uri, uri: line };
    return uri;
}
/** Writes a tag line: '#', its name, and its value after ':' when it has one. */
export function writeTag(options: { readonly name: string; readonly value?: string }) {
    if (options.value === undefined) {
        return `${COMMENT_PREFIX}${options.name}`;
    }
    return `${COMMENT_PREFIX}${options.name}${TAG_VALUE_SEPARATOR}${options.value}`;
}
