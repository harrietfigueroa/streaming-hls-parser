// Measures this library against the popular JavaScript HLS playlist parsers on
// npm, each on the same playlists: the 11,701-segment fixture, a short live
// Media Playlist, and a Multivariant Playlist, as whole strings, and the large
// fixture again as a stream of string chunks for the parsers that take input
// incrementally. The parsers do different work for the same text, which the
// timings include: this library validates every rule, builds frozen objects, and
// resolves each segment's carried-forward fields; hls.js resolves every URI
// against a base URL; m3u8-parser and hls-parser convert values without
// reporting broken rules. A setup check confirms each parser read every unit of
// each playlist, so no case times a parser that stopped early.
import { readFileSync } from "node:fs";

import hlsParser from "hls-parser";
import { M3U8Parser, PlaylistLevelType } from "hls.js";
import { Parser as M3u8Parser } from "m3u8-parser";
import { type TestContext, test } from "vitest";

import * as defaultEntry from "../src/index.js";
import { assertCondition } from "../src/library/assert.js";
import * as precompiledEntry from "../src/precompiled.js";

// Vitest's module runner reads each import through an export getter, so each
// namespace is read once here and every case pays the same per-call cost.
const { HLS: defaultHLS, ParseKind, PlaylistKind, StreamPartKind } = defaultEntry;
const { HLS: precompiledHLS } = precompiledEntry;

const BENCH_TIME_MS = 5000;
const BENCH_WARMUP_TIME_MS = 1000;
const benchOptions = { time: BENCH_TIME_MS, warmupTime: BENCH_WARMUP_TIME_MS } as const;
// Five cases of warmup and timing run about 30 s, so a test past this bound is stalled.
const BENCH_TEST_TIMEOUT_MS = 180_000;
const testOptions = { timeout: BENCH_TEST_TIMEOUT_MS } as const;

const ENCODING = "utf8";
const LARGE_FIXTURE_PATH = new URL("../tests/fixtures/very-large-playlist.m3u8", import.meta.url);
const LIVE_FIXTURE_PATH = new URL("../tests/fixtures/spec/section-9.3.m3u8", import.meta.url);
const MULTIVARIANT_FIXTURE_PATH = new URL("../tests/fixtures/spec/section-9.7.m3u8", import.meta.url);
// The hls.js parser resolves each URI against the playlist's own URL, which it takes as an argument.
const BASE_URL = "https://example.com/playlist.m3u8";
// A 64 KiB chunk is a typical network read. The fixtures are ASCII, so a chunk's length in code
// units is its length in bytes.
const STREAM_CHUNK_BYTES = 64 * 1024;

const largeText = readFileSync(LARGE_FIXTURE_PATH, { encoding: ENCODING });
const liveText = readFileSync(LIVE_FIXTURE_PATH, { encoding: ENCODING });
const multivariantText = readFileSync(MULTIVARIANT_FIXTURE_PATH, { encoding: ENCODING });

// Every benchmark body writes its result here, so the engine cannot discard the parse as dead code.
let sink: unknown;

function cut(text: string, length: number) {
    const chunks: string[] = [];
    for (let start = 0; start < text.length; start += length) {
        chunks.push(text.slice(start, start + length));
    }
    return chunks;
}

const largeChunks = cut(largeText, STREAM_CHUNK_BYTES);

async function* fromChunks(chunks: readonly string[]) {
    for (const chunk of chunks) {
        yield chunk;
    }
}

function parseWithM3u8Parser(chunks: readonly string[]) {
    const parser = new M3u8Parser();
    for (const chunk of chunks) {
        parser.push(chunk);
    }
    parser.end();
    return parser.manifest;
}

function parseMediaWithHlsJs(text: string) {
    return M3U8Parser.parseLevelPlaylist(text, BASE_URL, 0, PlaylistLevelType.MAIN, 0, null);
}

/** The count of units each parser read from `text`: its segments, or its variants for a Multivariant Playlist. */
function unitCountsOf(text: string) {
    const outcome = defaultHLS.safeParse(text);
    assertCondition(outcome.kind === ParseKind.parsed, `The playlist parsed as ${outcome.kind}.`);
    const { playlist } = outcome;
    const manifest = parseWithM3u8Parser([text]);
    const parsed = hlsParser.parse(text);
    if (playlist.kind === PlaylistKind.media) {
        assertCondition(!parsed.isMasterPlaylist, "hls-parser read a Media Playlist as a Multivariant Playlist.");
        const details = parseMediaWithHlsJs(text);
        const counts = {
            library: playlist.segments.length,
            m3u8Parser: manifest.segments.length,
            hlsParser: parsed.segments.length,
            hlsJs: details.fragments.length,
        };
        return counts;
    }
    assertCondition(parsed.isMasterPlaylist, "hls-parser read a Multivariant Playlist as a Media Playlist.");
    const multivariant = M3U8Parser.parseMasterPlaylist(text, BASE_URL);
    const playlists = manifest.playlists;
    assertCondition(playlists !== undefined, "m3u8-parser read a Multivariant Playlist with no playlists.");
    const counts = {
        library: playlist.variants.length,
        m3u8Parser: playlists.length,
        hlsParser: parsed.variants.length,
        hlsJs: multivariant.levels.length,
    };
    return counts;
}

for (const text of [largeText, liveText, multivariantText]) {
    const counts = unitCountsOf(text);
    assertCondition(counts.m3u8Parser === counts.library, `m3u8-parser read ${counts.m3u8Parser} of ${counts.library} units.`);
    assertCondition(counts.hlsParser === counts.library, `hls-parser read ${counts.hlsParser} of ${counts.library} units.`);
    assertCondition(counts.hlsJs === counts.library, `hls.js read ${counts.hlsJs} of ${counts.library} units.`);
}

/** The static cases for one playlist, each a named function that parses `text` whole. */
function staticCasesOf(options: { readonly text: string; readonly isMultivariant: boolean }) {
    const { text, isMultivariant } = options;
    function parseDefault() {
        sink = defaultHLS.safeParse(text);
    }
    function parsePrecompiled() {
        sink = precompiledHLS.safeParse(text);
    }
    function parseM3u8Parser() {
        sink = parseWithM3u8Parser([text]);
    }
    function parseHlsParser() {
        sink = hlsParser.parse(text);
    }
    function parseHlsJs() {
        if (isMultivariant) {
            sink = M3U8Parser.parseMasterPlaylist(text, BASE_URL);
            return;
        }
        sink = parseMediaWithHlsJs(text);
    }
    return { parseDefault, parsePrecompiled, parseM3u8Parser, parseHlsParser, parseHlsJs };
}

async function compareStatic(options: { readonly context: TestContext; readonly text: string; readonly isMultivariant: boolean }) {
    const { bench } = options.context;
    const cases = staticCasesOf(options);
    await bench.compare(
        bench("streaming-hls-parser", cases.parseDefault),
        bench("streaming-hls-parser/precompiled", cases.parsePrecompiled),
        bench("m3u8-parser", cases.parseM3u8Parser),
        bench("hls-parser", cases.parseHlsParser),
        bench("hls.js M3U8Parser", cases.parseHlsJs),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The static benchmarks wrote no result.");
}

async function compareLarge(context: TestContext) {
    await compareStatic({ context, text: largeText, isMultivariant: false });
}

async function compareLive(context: TestContext) {
    await compareStatic({ context, text: liveText, isMultivariant: false });
}

async function compareMultivariant(context: TestContext) {
    await compareStatic({ context, text: multivariantText, isMultivariant: true });
}

async function streamDefault() {
    const parts = defaultHLS.safeParse(fromChunks(largeChunks));
    let partCount = 0;
    for await (const part of parts) {
        assertCondition(part.kind !== StreamPartKind.malformed, "The streamed fixture is malformed.");
        partCount += 1;
    }
    sink = partCount;
}

async function streamPrecompiled() {
    const parts = precompiledHLS.safeParse(fromChunks(largeChunks));
    let partCount = 0;
    for await (const part of parts) {
        assertCondition(part.kind !== StreamPartKind.malformed, "The streamed fixture is malformed.");
        partCount += 1;
    }
    sink = partCount;
}

function streamM3u8Parser() {
    sink = parseWithM3u8Parser(largeChunks);
}

async function compareStreaming({ bench }: TestContext) {
    await bench.compare(
        bench("streaming-hls-parser", streamDefault),
        bench("streaming-hls-parser/precompiled", streamPrecompiled),
        bench("m3u8-parser", streamM3u8Parser),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The streaming benchmarks wrote no result.");
}

test("11,701-segment fixture as one string, against other parsers", testOptions, compareLarge);
test("section 9.3's live Media Playlist as one string, against other parsers", testOptions, compareLive);
test("section 9.7's Multivariant Playlist as one string, against other parsers", testOptions, compareMultivariant);
test("11,701-segment fixture in 64 KiB string chunks, against other parsers", testOptions, compareStreaming);
