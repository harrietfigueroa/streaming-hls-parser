// Measures a whole parse through each entry over the 11,701-segment fixture:
// the default entry's runtime schemas against the precompiled entry's compiled
// ones, with the scanner and the spanning checks the same in both.
import { readFileSync } from "node:fs";

import { type TestContext, test } from "vitest";

import * as defaultEntry from "../src/index.js";
import { assertCondition } from "../src/library/assert.js";
import * as precompiledEntry from "../src/precompiled.js";

// Vitest's module runner reads each import through an export getter, so each
// namespace is read once here and both cases pay the same per-call cost.
const { HLS: defaultHLS, ParseKind } = defaultEntry;
const { HLS: precompiledHLS } = precompiledEntry;

const BENCH_TIME_MS = 5000;
const BENCH_WARMUP_TIME_MS = 1000;
const benchOptions = { time: BENCH_TIME_MS, warmupTime: BENCH_WARMUP_TIME_MS } as const;

const FIXTURE_PATH = new URL("../tests/fixtures/very-large-playlist.m3u8", import.meta.url);
const FIXTURE_ENCODING = "utf8";

const fixtureText = readFileSync(FIXTURE_PATH, { encoding: FIXTURE_ENCODING });

// Both entries must parse the fixture, or the benchmark times a failure path.
for (const hls of [defaultHLS, precompiledHLS]) {
    const outcome = hls.safeParse(fixtureText);
    assertCondition(outcome.kind === ParseKind.parsed, `The fixture parsed as ${outcome.kind}.`);
}

// Every benchmark body writes its result here, so the engine cannot discard the parse as dead code.
let sink: unknown;

function parseDefault() {
    sink = defaultHLS.safeParse(fixtureText);
}
function parsePrecompiled() {
    sink = precompiledHLS.safeParse(fixtureText);
}

async function compareEntries({ bench }: TestContext) {
    await bench.compare(bench("default entry", parseDefault), bench("precompiled entry", parsePrecompiled), benchOptions);
    assertCondition(sink !== undefined, "The entry benchmarks wrote no result.");
}

test("11,701-segment fixture through each entry", compareEntries);
