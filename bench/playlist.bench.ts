// Measures the per-tag conversion cost across a real-world-shaped playlist: the
// 11,701-segment fixture, each segment carrying EXTINF and
// EXT-X-PROGRAM-DATE-TIME, read by a minimal line loop. The loop stands in for
// the scanner, so the difference between methods is the conversion cost alone.
import { readFileSync } from "node:fs";

import { type TestContext, test } from "vitest";
import { z } from "zod";

import { assertCondition } from "../src/library/assert.js";
import * as prototypeTags from "./prototype-tags.js";

// Vitest's module runner reads each import through an export getter, which would
// add a getter call to every iteration of the runtime and hand-written cases but
// not the locally declared compiled schemas. Reading each export once here
// measures all three methods the same way.
const { ConversionKind, convertExtinf, convertProgramDateTime, extinfSchema, programDateTimeSchema } =
    prototypeTags;

const BENCH_TIME_MS = 3000;
const BENCH_WARMUP_TIME_MS = 500;
const benchOptions = { time: BENCH_TIME_MS, warmupTime: BENCH_WARMUP_TIME_MS } as const;

const FIXTURE_PATH = new URL("../tests/fixtures/very-large-playlist.m3u8", import.meta.url);
const FIXTURE_ENCODING = "utf8";
const FIXTURE_SEGMENT_COUNT = 11701;
const LINE_SEPARATOR = "\n";
const EXTINF_PREFIX = "#EXTINF:";
const PROGRAM_DATE_TIME_PREFIX = "#EXT-X-PROGRAM-DATE-TIME:";

const fixtureText = readFileSync(FIXTURE_PATH, { encoding: FIXTURE_ENCODING });
const fixtureLines = fixtureText.split(LINE_SEPARATOR);

const compiledExtinfSchema = z.compile(extinfSchema, { strict: true });
const compiledProgramDateTimeSchema = z.compile(programDateTimeSchema, { strict: true });

type TagParser = (value: string) => boolean;

function parseExtinfRuntime(value: string) {
    return extinfSchema.safeParse(value).success;
}
function parseExtinfCompiled(value: string) {
    return compiledExtinfSchema.safeParse(value).success;
}
function parseExtinfHandWritten(value: string) {
    return convertExtinf(value).kind === ConversionKind.converted;
}
function parseProgramDateTimeRuntime(value: string) {
    return programDateTimeSchema.safeParse(value).success;
}
function parseProgramDateTimeCompiled(value: string) {
    return compiledProgramDateTimeSchema.safeParse(value).success;
}
function parseProgramDateTimeHandWritten(value: string) {
    return convertProgramDateTime(value).kind === ConversionKind.converted;
}

/** Converts every EXTINF and EXT-X-PROGRAM-DATE-TIME line, returning how many segments converted fully. */
function countConvertedSegments(options: {
    readonly lines: readonly string[];
    readonly parseExtinf: TagParser;
    readonly parseProgramDateTime: TagParser;
}) {
    let extinfCount = 0;
    let programDateTimeCount = 0;
    for (const line of options.lines) {
        if (line.startsWith(EXTINF_PREFIX)) {
            const value = line.slice(EXTINF_PREFIX.length);
            const isConverted = options.parseExtinf(value);
            if (isConverted) {
                extinfCount += 1;
            }
        } else if (line.startsWith(PROGRAM_DATE_TIME_PREFIX)) {
            const value = line.slice(PROGRAM_DATE_TIME_PREFIX.length);
            const isConverted = options.parseProgramDateTime(value);
            if (isConverted) {
                programDateTimeCount += 1;
            }
        }
    }
    return Math.min(extinfCount, programDateTimeCount);
}

const runtimeOptions = {
    lines: fixtureLines,
    parseExtinf: parseExtinfRuntime,
    parseProgramDateTime: parseProgramDateTimeRuntime,
} as const;
const compiledOptions = {
    lines: fixtureLines,
    parseExtinf: parseExtinfCompiled,
    parseProgramDateTime: parseProgramDateTimeCompiled,
} as const;
const handWrittenOptions = {
    lines: fixtureLines,
    parseExtinf: parseExtinfHandWritten,
    parseProgramDateTime: parseProgramDateTimeHandWritten,
} as const;

// Every method must convert every segment, or the benchmark times a failure path.
for (const options of [runtimeOptions, compiledOptions, handWrittenOptions]) {
    const convertedCount = countConvertedSegments(options);
    assertCondition(
        convertedCount === FIXTURE_SEGMENT_COUNT,
        `Converted ${convertedCount} of ${FIXTURE_SEGMENT_COUNT} fixture segments.`,
    );
}

// Every benchmark body writes its result here, so the engine cannot discard the
// conversion as dead code.
let sink: unknown;

function convertFixtureRuntime() {
    sink = countConvertedSegments(runtimeOptions);
}
function convertFixtureCompiled() {
    sink = countConvertedSegments(compiledOptions);
}
function convertFixtureHandWritten() {
    sink = countConvertedSegments(handWrittenOptions);
}

async function compareFixture({ bench }: TestContext) {
    await bench.compare(
        bench("zod runtime", convertFixtureRuntime),
        bench("zod compiled", convertFixtureCompiled),
        bench("hand-written", convertFixtureHandWritten),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The fixture benchmarks wrote no result.");
}

test("11,701-segment fixture", compareFixture);