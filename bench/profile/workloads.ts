// The workloads `npm run profile` profiles, each a named function whose name is
// the root the CPU summary finds it by: the 11,701-segment fixture, section 9.3's
// live Media Playlist, and section 9.7's Multivariant Playlist, each parsed whole
// through the default entry, the large fixture parsed whole through the
// precompiled entry too, and the large fixture streamed in 64 KiB chunks.
// Each repeats its parse enough times for the sampler to see every hot path.
import { readFileSync } from "node:fs";

import * as defaultEntry from "../../src/index.js";
import { assertCondition } from "../../src/library/assert.js";
import * as precompiledEntry from "../../src/precompiled.js";

const { HLS, ParseKind, StreamPartKind } = defaultEntry;
const { HLS: precompiledHLS } = precompiledEntry;

const ENCODING = "utf8";
const LARGE_FIXTURE_PATH = new URL("../../tests/fixtures/very-large-playlist.m3u8", import.meta.url);
const LIVE_FIXTURE_PATH = new URL("../../tests/fixtures/spec/section-9.3.m3u8", import.meta.url);
const MULTIVARIANT_FIXTURE_PATH = new URL("../../tests/fixtures/spec/section-9.7.m3u8", import.meta.url);
// A 64 KiB chunk is a typical network read. The fixtures are ASCII, so a chunk's length in code
// units is its length in bytes.
const STREAM_CHUNK_BYTES = 64 * 1024;
// Each count runs its workload for about 1.5 s at the measured p75.
const LARGE_PARSE_COUNT = 20;
const LIVE_PARSE_COUNT = 40_000;
const MULTIVARIANT_PARSE_COUNT = 20_000;
const STREAM_PARSE_COUNT = 15;

const largeText = readFileSync(LARGE_FIXTURE_PATH, { encoding: ENCODING });
const liveText = readFileSync(LIVE_FIXTURE_PATH, { encoding: ENCODING });
const multivariantText = readFileSync(MULTIVARIANT_FIXTURE_PATH, { encoding: ENCODING });

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

// Every workload writes its result here, so the engine cannot discard the parse as dead code.
let sink: unknown;

function parseRepeatedly(options: { readonly hls: typeof HLS; readonly text: string; readonly count: number }) {
    for (let index = 0; index < options.count; index += 1) {
        const outcome = options.hls.safeParse(options.text);
        assertCondition(outcome.kind === ParseKind.parsed, `The workload's playlist parsed as ${outcome.kind}.`);
        sink = outcome;
    }
}

export function profileLargeStatic() {
    parseRepeatedly({ hls: HLS, text: largeText, count: LARGE_PARSE_COUNT });
}

export function profileLargeStaticPrecompiled() {
    parseRepeatedly({ hls: precompiledHLS, text: largeText, count: LARGE_PARSE_COUNT });
}

export function profileLiveStatic() {
    parseRepeatedly({ hls: HLS, text: liveText, count: LIVE_PARSE_COUNT });
}

export function profileMultivariantStatic() {
    parseRepeatedly({ hls: HLS, text: multivariantText, count: MULTIVARIANT_PARSE_COUNT });
}

export async function profileLargeStreaming() {
    for (let index = 0; index < STREAM_PARSE_COUNT; index += 1) {
        const parts = HLS.safeParse(fromChunks(largeChunks));
        let partCount = 0;
        for await (const part of parts) {
            assertCondition(part.kind !== StreamPartKind.malformed, "The streamed fixture is malformed.");
            partCount += 1;
        }
        sink = partCount;
    }
}

/** Every workload, in the order the profiles run them. */
export const workloads = [
    profileLargeStatic,
    profileLargeStaticPrecompiled,
    profileLiveStatic,
    profileMultivariantStatic,
    profileLargeStreaming,
] as const;

/** Runs each workload once at a fraction of its count, so the profiles measure optimized code. */
export async function warmUp() {
    parseRepeatedly({ hls: HLS, text: largeText, count: 2 });
    parseRepeatedly({ hls: precompiledHLS, text: largeText, count: 2 });
    parseRepeatedly({ hls: HLS, text: liveText, count: 2000 });
    parseRepeatedly({ hls: HLS, text: multivariantText, count: 1000 });
    for await (const part of HLS.safeParse(fromChunks(largeChunks))) {
        sink = part;
    }
    assertCondition(sink !== undefined, "The warm-up wrote no result.");
}
