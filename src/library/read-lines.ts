// The streaming line reader. It turns a stream of string or UTF-8 byte chunks
// into lines with their terminators, holding at most one unterminated line and
// one chunk at a time, and it stops at the first invalid UTF-8 or at a line
// past its bound. It applies no line rule beyond the encoding; the scanner does.
import { definitionRules } from "../4-playlists/4.1-definition-of-a-playlist.js";
import { assertCondition } from "./assert.js";
import type { Issue } from "./rule.js";
import { isWithinUtf8Bytes, utf8ByteLength } from "./utf8.js";

export const LineReadKind = { line: "line", malformed: "malformed", limitExceeded: "limitExceeded" } as const;
export type LineReadKind = (typeof LineReadKind)[keyof typeof LineReadKind];

type LineReadPayloads = {
    /** One line without its terminator, and the terminator: CR LF, LF, or empty for a last line without one. */
    [LineReadKind.line]: { readonly text: string; readonly terminator: string };
    [LineReadKind.malformed]: { readonly issue: Issue };
    [LineReadKind.limitExceeded]: Record<never, never>;
};
type LineReadMember<K extends LineReadKind> = { readonly kind: K } & LineReadPayloads[K];
/** One read from a chunk stream: a line, or the failure ending the read. */
export type LineRead = { [K in LineReadKind]: LineReadMember<K> }[LineReadKind];

const DecodeKind = { decoded: "decoded", malformed: "malformed" } as const;
type DecodeKind = (typeof DecodeKind)[keyof typeof DecodeKind];

type DecodePayloads = {
    [DecodeKind.decoded]: { readonly text: string };
    [DecodeKind.malformed]: Record<never, never>;
};
type DecodeMember<K extends DecodeKind> = { readonly kind: K } & DecodePayloads[K];
type Decode = { [K in DecodeKind]: DecodeMember<K> }[DecodeKind];

const LINE_FEED = "\n";
const CARRIAGE_RETURN = "\r";
const CARRIAGE_RETURN_LINE_FEED = "\r\n";
const NOT_FOUND = -1;
const UTF_8 = "utf-8";
const INVALID_UTF_8_DETAIL = "The bytes are not valid UTF-8.";
const NO_BYTES = new Uint8Array();

const malformedRead: LineRead = Object.freeze({
    kind: LineReadKind.malformed,
    issue: Object.freeze({ rule: definitionRules.utf8Encoding, detail: INVALID_UTF_8_DETAIL }),
});
const limitExceededRead: LineRead = Object.freeze({ kind: LineReadKind.limitExceeded });

// @types/node 22 declares TextDecoder as a global value without a global type of the same name.
type Decoder = InstanceType<typeof TextDecoder>;

/**
 * Decodes one chunk, holding an incomplete last sequence for the next, or the final chunk, which
 * flushes what is held. A fatal TextDecoder throws a TypeError on invalid UTF-8, which is the
 * outcome this function returns instead.
 */
function decode(options: { readonly decoder: Decoder; readonly bytes: Uint8Array; readonly isFinal: boolean }) {
    const { decoder, bytes, isFinal } = options;
    try {
        const text = decoder.decode(bytes, { stream: !isFinal });
        const decoded: Decode = { kind: DecodeKind.decoded, text };
        return decoded;
    } catch (error) {
        if (error instanceof TypeError) {
            const malformed: Decode = { kind: DecodeKind.malformed };
            return malformed;
        }
        throw error;
    }
}

/** Splits a line ending at a line feed into its text and terminator. */
function toLine(lineWithCarriageReturn: string) {
    if (lineWithCarriageReturn.endsWith(CARRIAGE_RETURN)) {
        const text = lineWithCarriageReturn.slice(0, -CARRIAGE_RETURN.length);
        const read: LineRead = { kind: LineReadKind.line, text, terminator: CARRIAGE_RETURN_LINE_FEED };
        return read;
    }
    const read: LineRead = { kind: LineReadKind.line, text: lineWithCarriageReturn, terminator: LINE_FEED };
    return read;
}

/** Splits the lines a line feed ends off the front of `text`, and the unterminated rest. */
function splitTerminated(text: string) {
    const lines: LineReadMember<typeof LineReadKind.line>[] = [];
    let lineStart = 0;
    // Each iteration moves past one line feed, so the loop runs at most once per character.
    for (let lineFeedIndex = text.indexOf(LINE_FEED); lineFeedIndex !== NOT_FOUND; ) {
        const lineWithCarriageReturn = text.slice(lineStart, lineFeedIndex);
        lines.push(toLine(lineWithCarriageReturn));
        lineStart = lineFeedIndex + LINE_FEED.length;
        lineFeedIndex = text.indexOf(LINE_FEED, lineStart);
    }
    return { lines, rest: text.slice(lineStart) };
}

/** The UTF-8 bytes of an unterminated line, leaving out a trailing CR, which may be the first half of a CR LF. */
function unterminatedLineBytes(unterminated: string) {
    if (unterminated.endsWith(CARRIAGE_RETURN)) {
        const withoutCarriageReturn = unterminated.slice(0, -CARRIAGE_RETURN.length);
        return utf8ByteLength(withoutCarriageReturn);
    }
    return utf8ByteLength(unterminated);
}

/**
 * Reads `chunks` as lines, yielding the lines each chunk completes as one batch, so a reader awaits
 * once per chunk rather than once per line; a chunk that completes no line yields no batch. Byte
 * chunks are decoded as UTF-8 with a Byte Order Mark kept, so the line rules can report it; string
 * chunks are taken as decoded, and a stream holds chunks of one type. A line of more than
 * `lineBytesMax` UTF-8 bytes, terminated or not, ends the read as `limitExceeded`, and invalid UTF-8
 * ends it as `malformed`; either failure is the last read of the last batch.
 */
export async function* readLines(options: {
    readonly chunks: AsyncIterable<string> | AsyncIterable<Uint8Array>;
    readonly lineBytesMax: number;
}) {
    const { chunks, lineBytesMax } = options;
    assertCondition(Number.isSafeInteger(lineBytesMax), `lineBytesMax ${lineBytesMax} is not an integer.`);
    const decoder = new TextDecoder(UTF_8, { fatal: true, ignoreBOM: true });
    let chunkType: string | undefined;
    let pending = "";
    // An upper bound on the UTF-8 bytes of `pending`, counted per chunk, which overcounts a surrogate
    // pair split across two string chunks and so is recounted exactly before it ends a read.
    let pendingBytesMax = 0;
    // The source sets the chunk count; each chunk's lines are bounded by its length, and `pending` by lineBytesMax.
    for await (const chunk of chunks) {
        if (chunkType === undefined) {
            chunkType = typeof chunk;
        }
        assertCondition(typeof chunk === chunkType, `A ${typeof chunk} chunk follows ${chunkType} chunks.`);
        let text: string;
        if (typeof chunk === "string") {
            text = chunk;
        } else {
            const decoded = decode({ decoder, bytes: chunk, isFinal: false });
            if (decoded.kind === DecodeKind.malformed) {
                yield [malformedRead];
                return;
            }
            text = decoded.text;
        }
        const split = splitTerminated(pending + text);
        const batch: LineRead[] = [];
        for (const read of split.lines) {
            const isLineWithinBytes = isWithinUtf8Bytes(read.text, lineBytesMax);
            if (!isLineWithinBytes) {
                batch.push(limitExceededRead);
                yield batch;
                return;
            }
            batch.push(read);
        }
        pending = split.rest;
        if (split.lines.length > 0) {
            pendingBytesMax = utf8ByteLength(pending);
        } else {
            pendingBytesMax += utf8ByteLength(text);
        }
        const isPendingWithinBound = pendingBytesMax <= lineBytesMax;
        if (!isPendingWithinBound) {
            pendingBytesMax = unterminatedLineBytes(pending);
        }
        if (pendingBytesMax > lineBytesMax) {
            batch.push(limitExceededRead);
            yield batch;
            return;
        }
        if (batch.length > 0) {
            yield batch;
        }
    }
    const flushed = decode({ decoder, bytes: NO_BYTES, isFinal: true });
    if (flushed.kind === DecodeKind.malformed) {
        yield [malformedRead];
        return;
    }
    pending += flushed.text;
    if (pending.length === 0) {
        return;
    }
    const isLastWithinBytes = isWithinUtf8Bytes(pending, lineBytesMax);
    if (!isLastWithinBytes) {
        yield [limitExceededRead];
        return;
    }
    const last: LineRead = { kind: LineReadKind.line, text: pending, terminator: "" };
    yield [last];
}
