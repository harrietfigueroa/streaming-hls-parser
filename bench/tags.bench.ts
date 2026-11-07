// Measures converting one raw tag to a typed value three ways: the zod runtime
// parser, the same schema under z.compile, and a hand-written floor. Compiling
// with strict: true throws when a schema falls back to the runtime parser, so a
// compiled case that runs is one that compiled.
import { type TestContext, test } from "vitest";
import { z } from "zod";

import { assertCondition } from "../src/library/assert.js";
import * as prototypeTags from "./prototype-tags.js";
import type { RawAttributes } from "./prototype-tags.js";

// Vitest's module runner reads each import through an export getter, which would
// add a getter call to every iteration of the runtime and hand-written cases but
// not the locally declared compiled schemas. Reading each export once here
// measures all three methods the same way.
const {
    ConversionKind,
    convertExtinf,
    convertPart,
    convertProgramDateTime,
    convertStreamInf,
    extinfSchema,
    partSchema,
    programDateTimeSchema,
    streamInfSchema,
} = prototypeTags;

const BENCH_TIME_MS = 1000;
const BENCH_WARMUP_TIME_MS = 200;
const benchOptions = { time: BENCH_TIME_MS, warmupTime: BENCH_WARMUP_TIME_MS } as const;

// Every benchmark body writes its result here, so the engine cannot discard the
// conversion as dead code.
let sink: unknown;

const EXTINF_VALUE = "6.00000,";
const PROGRAM_DATE_TIME_VALUE = "2025-04-07T18:26:20.533Z";
const streamInfAttributes: RawAttributes = {
    BANDWIDTH: "7680000",
    "AVERAGE-BANDWIDTH": "6000000",
    CODECS: '"avc1.640028,mp4a.40.2"',
    RESOLUTION: "1920x1080",
    "FRAME-RATE": "29.970",
};
const partAttributes: RawAttributes = {
    DURATION: "0.33334",
    URI: '"filePart271.0.ts"',
    INDEPENDENT: "YES",
};

const compiledExtinfSchema = z.compile(extinfSchema, { strict: true });
const compiledProgramDateTimeSchema = z.compile(programDateTimeSchema, { strict: true });
const compiledStreamInfSchema = z.compile(streamInfSchema, { strict: true });
const compiledPartSchema = z.compile(partSchema, { strict: true });

// Each input must convert under every method, or the benchmark times the failure path.
const setupResults = [
    extinfSchema.safeParse(EXTINF_VALUE).success,
    compiledExtinfSchema.safeParse(EXTINF_VALUE).success,
    convertExtinf(EXTINF_VALUE).kind === ConversionKind.converted,
    programDateTimeSchema.safeParse(PROGRAM_DATE_TIME_VALUE).success,
    compiledProgramDateTimeSchema.safeParse(PROGRAM_DATE_TIME_VALUE).success,
    convertProgramDateTime(PROGRAM_DATE_TIME_VALUE).kind === ConversionKind.converted,
    streamInfSchema.safeParse(streamInfAttributes).success,
    compiledStreamInfSchema.safeParse(streamInfAttributes).success,
    convertStreamInf(streamInfAttributes).kind === ConversionKind.converted,
    partSchema.safeParse(partAttributes).success,
    compiledPartSchema.safeParse(partAttributes).success,
    convertPart(partAttributes).kind === ConversionKind.converted,
] as const;
for (const [index, isConverted] of setupResults.entries()) {
    assertCondition(isConverted, `Benchmark input ${index} failed to convert.`);
}

function parseExtinfRuntime() {
    sink = extinfSchema.safeParse(EXTINF_VALUE);
}
function parseExtinfCompiled() {
    sink = compiledExtinfSchema.safeParse(EXTINF_VALUE);
}
function parseExtinfHandWritten() {
    sink = convertExtinf(EXTINF_VALUE);
}

function parseProgramDateTimeRuntime() {
    sink = programDateTimeSchema.safeParse(PROGRAM_DATE_TIME_VALUE);
}
function parseProgramDateTimeCompiled() {
    sink = compiledProgramDateTimeSchema.safeParse(PROGRAM_DATE_TIME_VALUE);
}
function parseProgramDateTimeHandWritten() {
    sink = convertProgramDateTime(PROGRAM_DATE_TIME_VALUE);
}

function parseStreamInfRuntime() {
    sink = streamInfSchema.safeParse(streamInfAttributes);
}
function parseStreamInfCompiled() {
    sink = compiledStreamInfSchema.safeParse(streamInfAttributes);
}
function parseStreamInfHandWritten() {
    sink = convertStreamInf(streamInfAttributes);
}

function parsePartRuntime() {
    sink = partSchema.safeParse(partAttributes);
}
function parsePartCompiled() {
    sink = compiledPartSchema.safeParse(partAttributes);
}
function parsePartHandWritten() {
    sink = convertPart(partAttributes);
}

async function compareExtinf({ bench }: TestContext) {
    await bench.compare(
        bench("zod runtime", parseExtinfRuntime),
        bench("zod compiled", parseExtinfCompiled),
        bench("hand-written", parseExtinfHandWritten),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The EXTINF benchmarks wrote no result.");
}

async function compareProgramDateTime({ bench }: TestContext) {
    await bench.compare(
        bench("zod runtime", parseProgramDateTimeRuntime),
        bench("zod compiled", parseProgramDateTimeCompiled),
        bench("hand-written", parseProgramDateTimeHandWritten),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The EXT-X-PROGRAM-DATE-TIME benchmarks wrote no result.");
}

async function compareStreamInf({ bench }: TestContext) {
    await bench.compare(
        bench("zod runtime", parseStreamInfRuntime),
        bench("zod compiled", parseStreamInfCompiled),
        bench("hand-written", parseStreamInfHandWritten),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The EXT-X-STREAM-INF benchmarks wrote no result.");
}

async function comparePart({ bench }: TestContext) {
    await bench.compare(
        bench("zod runtime", parsePartRuntime),
        bench("zod compiled", parsePartCompiled),
        bench("hand-written", parsePartHandWritten),
        benchOptions,
    );
    assertCondition(sink !== undefined, "The EXT-X-PART benchmarks wrote no result.");
}

test("EXTINF", compareExtinf);
test("EXT-X-PROGRAM-DATE-TIME", compareProgramDateTime);
test("EXT-X-STREAM-INF", compareStreamInf);
test("EXT-X-PART", comparePart);