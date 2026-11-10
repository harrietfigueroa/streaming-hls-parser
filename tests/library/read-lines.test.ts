// These tests pin readLines against splitLines: every way of cutting one text
// into chunks, as strings or as UTF-8 bytes, reads the same lines, each chunk's
// complete lines arrive as one batch, and the two failures, invalid UTF-8 and a
// line past its bound, end the read.
import { describe, expect, test } from "vitest";

import { definitionRules } from "../../src/4-playlists/4.1-definition-of-a-playlist.js";
import { type LineRead, LineReadKind, readLines } from "../../src/library/read-lines.js";

const LINE_BYTES_MAX = 64;
const encoder = new TextEncoder();

async function* fromChunks<Chunk>(chunks: readonly Chunk[]) {
    for (const chunk of chunks) {
        yield chunk;
    }
}

// Far more chunks than the bound, so a read that stops at the bound leaves most of them unread.
const LONG_LINE_CHUNK_COUNT = LINE_BYTES_MAX * 1000;

/** A source of one-character chunks with no line feed, counting the chunks read from it. */
function longLine() {
    const source = { readCount: 0, chunks: longLineChunks() };
    async function* longLineChunks() {
        for (let index = 0; index < LONG_LINE_CHUNK_COUNT; index += 1) {
            source.readCount += 1;
            yield "a";
        }
    }
    return source;
}

/** Every read, in order, with the batches flattened. */
async function collect(batches: AsyncIterable<readonly LineRead[]>) {
    const collected: LineRead[] = [];
    for await (const batch of batches) {
        for (const read of batch) {
            collected.push(read);
        }
    }
    return collected;
}

async function collectBatches(batches: AsyncIterable<readonly LineRead[]>) {
    const collected: (readonly LineRead[])[] = [];
    for await (const batch of batches) {
        collected.push(batch);
    }
    return collected;
}

function line(options: { readonly text: string; readonly terminator: string }) {
    const read: LineRead = { kind: LineReadKind.line, text: options.text, terminator: options.terminator };
    return read;
}

/** Cuts `text` into chunks of `size` characters. */
function cut(text: string, size: number) {
    const chunks: string[] = [];
    for (let start = 0; start < text.length; start += size) {
        chunks.push(text.slice(start, start + size));
    }
    return chunks;
}

/** Cuts `text`'s UTF-8 bytes into chunks of `size` bytes, splitting multi-byte characters. */
function cutBytes(text: string, size: number) {
    const bytes = encoder.encode(text);
    const chunks: Uint8Array[] = [];
    for (let start = 0; start < bytes.length; start += size) {
        chunks.push(bytes.subarray(start, start + size));
    }
    return chunks;
}

const TEXT = "#EXTM3U\r\n#EXTINF:9.009,café\nfirst.ts\n\n\u{1F3B5}.ts";
const textLines = [
    { kind: LineReadKind.line, text: "#EXTM3U", terminator: "\r\n" },
    { kind: LineReadKind.line, text: "#EXTINF:9.009,café", terminator: "\n" },
    { kind: LineReadKind.line, text: "first.ts", terminator: "\n" },
    { kind: LineReadKind.line, text: "", terminator: "\n" },
    { kind: LineReadKind.line, text: "\u{1F3B5}.ts", terminator: "" },
] as const satisfies readonly LineRead[];
const CHUNK_SIZES = [1, 2, 3, 7, 100] as const;

describe("readLines", () => {
    test.each(CHUNK_SIZES)("reads the same lines from string chunks of %i characters", async (size) => {
        const chunks = fromChunks(cut(TEXT, size));
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual(textLines);
    });

    test.each(CHUNK_SIZES)("reads the same lines from byte chunks of %i bytes", async (size) => {
        const chunks = fromChunks(cutBytes(TEXT, size));
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual(textLines);
    });

    test("reads nothing from no chunks", async () => {
        const chunks = fromChunks<string>([]);
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual([]);
    });

    test("keeps a leading Byte Order Mark in byte chunks, for the line rules to report", async () => {
        const chunks = fromChunks(cutBytes("﻿#EXTM3U\n", 1));
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual([line({ text: "﻿#EXTM3U", terminator: "\n" })]);
    });

    const invalidBytes = [
        ["a byte no UTF-8 sequence starts with", [0x23, 0xff, 0x0a]],
        ["a sequence cut off at the end", [0x23, 0xc3]],
    ] as const;

    test.each(invalidBytes)("reports %s as section 4.1's encoding rule", async (_name, bytes) => {
        const chunks = fromChunks([Uint8Array.from(bytes)]);
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        const last = reads.at(-1);
        expect(last?.kind).toBe(LineReadKind.malformed);
        if (last?.kind === LineReadKind.malformed) {
            expect(last.issue.rule).toBe(definitionRules.utf8Encoding);
        }
    });

    test("reads a line of exactly the bound", async () => {
        const text = "é".repeat(LINE_BYTES_MAX / 2);
        const chunks = fromChunks(cut(`${text}\r\n`, 1));
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual([line({ text, terminator: "\r\n" })]);
    });

    test("stops a line one byte past the bound", async () => {
        const text = "a".repeat(LINE_BYTES_MAX + 1);
        const chunks = fromChunks([`${text}\n`]);
        const reads = await collect(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual([{ kind: LineReadKind.limitExceeded }]);
    });

    test("stops reading a line with no line feed once it passes the bound", async () => {
        const source = longLine();
        const reads = await collect(readLines({ chunks: source.chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(reads).toStrictEqual([{ kind: LineReadKind.limitExceeded }]);
        expect(source.readCount).toBe(LINE_BYTES_MAX + 1);
    });

    test("reads each chunk's complete lines as one batch, and none from a chunk that ends no line", async () => {
        const chunks = fromChunks(["a\nb\nc", "d", "e\nf"]);
        const batches = await collectBatches(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(batches).toStrictEqual([
            [line({ text: "a", terminator: "\n" }), line({ text: "b", terminator: "\n" })],
            [line({ text: "cde", terminator: "\n" })],
            [line({ text: "f", terminator: "" })],
        ]);
    });

    test("ends a batch with the failure, after the chunk's lines before the long one", async () => {
        const longText = "a".repeat(LINE_BYTES_MAX + 1);
        const chunks = fromChunks([`first\n${longText}\nlast\n`]);
        const batches = await collectBatches(readLines({ chunks, lineBytesMax: LINE_BYTES_MAX }));
        expect(batches).toStrictEqual([[line({ text: "first", terminator: "\n" }), { kind: LineReadKind.limitExceeded }]]);
    });
});
