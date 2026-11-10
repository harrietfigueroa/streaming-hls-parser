// Profiles the parser's workloads and prints where their time and allocations go:
// npm run profile
// It runs bench/profile/cpu.profile.ts under Node's --cpu-prof, passed through
// Vitest's --execArgv, and bench/profile/heap.profile.ts, which samples each
// workload's allocations itself, then summarizes both into .profiles/report.txt.
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { assertSchema } from "../src/library/assert.ts";
import { cpuProfileSchema, summarizeProfile } from "./cpu-profile.ts";
import { heapProfileSchema, summarizeHeapProfile } from "./heap-profile.ts";
import type { FileCost, FunctionCost } from "./profile-ranking.ts";

const REPOSITORY_URL = new URL("../", import.meta.url);
const PROFILES_DIRECTORY = new URL(".profiles/", REPOSITORY_URL);
const CPU_PROFILE_DIRECTORY = new URL("cpu/", PROFILES_DIRECTORY);
const HEAP_PROFILE_DIRECTORY = new URL("heap/", PROFILES_DIRECTORY);
const REPORT_PATH = new URL("report.txt", PROFILES_DIRECTORY);
const ENCODING = "utf8";
const CONFIG_PATH = "vitest.profile.config.ts";
// Vitest's --execArgv replaces the configuration's execArgv rather than adding to it, so every run
// imports the hook resolving the sources' .js specifiers itself.
const RESOLVE_HOOK_URL = new URL("bench/resolve-ts-extensions.ts", REPOSITORY_URL);
const CPU_WORKLOAD_PATH = "bench/profile/cpu.profile.ts";
const HEAP_WORKLOAD_PATH = "bench/profile/heap.profile.ts";
// One sample per 100 µs, ten times V8's default rate, so a short call still lands in a sample.
const CPU_SAMPLING_INTERVAL_MICROSECONDS = 100;
const RUN_TIMEOUT_MS = 600_000;
const FUNCTION_ROW_COUNT = 25;
const FILE_ROW_COUNT = 12;
const MICROSECONDS_PER_MILLISECOND = 1000;
const BYTES_PER_MEBIBYTE = 1024 * 1024;
const PERCENT = 100;
const ANONYMOUS_NAME = "(anonymous)";
const GENERATED_LABEL = "(generated code without a source URL)";
const NATIVE_PREFIX = "(native):";
const DEPENDENCY_PREFIX = "node_modules/";
const AMOUNT_COLUMN_WIDTH = 9;
const SHARE_COLUMN_WIDTH = 6;
const UNKNOWN_LINE = "?";
// Characters a function name could hold that a regular expression reads as syntax.
const REGEX_SYNTAX_PATTERN = /[.*+?^${}()|[\]\\]/gu;
// The workload names, which are the root functions the CPU summary finds each workload by.
const workloadNames = [
    "profileLargeStatic",
    "profileLargeStaticPrecompiled",
    "profileLiveStatic",
    "profileMultivariantStatic",
    "profileLargeStreaming",
] as const;

function runVitest(options: { readonly workloadPath: string; readonly execArgv: readonly string[] }) {
    const resolveHookPath = fileURLToPath(RESOLVE_HOOK_URL);
    const argumentList = ["vitest", "run", "--config", CONFIG_PATH, options.workloadPath, `--execArgv=--import=${resolveHookPath}`];
    for (const execArgument of options.execArgv) {
        argumentList.push(`--execArgv=${execArgument}`);
    }
    const result = spawnSync("npx", argumentList, {
        cwd: fileURLToPath(REPOSITORY_URL),
        stdio: ["ignore", "inherit", "inherit"],
        timeout: RUN_TIMEOUT_MS,
    });
    return result.status;
}

function formatShare(options: { readonly part: number; readonly whole: number }) {
    const share = (options.part / options.whole) * PERCENT;
    return `${share.toFixed(1).padStart(SHARE_COLUMN_WIDTH - 1)}%`;
}

function formatMilliseconds(microseconds: number) {
    const milliseconds = microseconds / MICROSECONDS_PER_MILLISECOND;
    return milliseconds.toFixed(1).padStart(AMOUNT_COLUMN_WIDTH);
}

function formatMebibytes(bytes: number) {
    const mebibytes = bytes / BYTES_PER_MEBIBYTE;
    return mebibytes.toFixed(1).padStart(AMOUNT_COLUMN_WIDTH);
}

const sourceLinesByFile = new Map<string, readonly string[]>();

function sourceLinesOf(file: string) {
    const cached = sourceLinesByFile.get(file);
    if (cached !== undefined) {
        return cached;
    }
    const text = readFileSync(new URL(file, REPOSITORY_URL), { encoding: ENCODING });
    const lines = text.split("\n");
    sourceLinesByFile.set(file, lines);
    return lines;
}

/**
 * The one-based line declaring `functionName` in `file`, as a function or as a method, or `?`
 * where no single line does. Vitest transforms the repository's own modules before running them,
 * so a profile's line numbers for them count lines of the transformed code.
 */
function declarationLineOf(options: { readonly file: string; readonly functionName: string }) {
    const name = options.functionName.replaceAll(REGEX_SYNTAX_PATTERN, "\\$&");
    const functionPattern = new RegExp(`\\bfunction\\*?\\s+${name}\\s*[<(]`, "u");
    const methodPattern = new RegExp(`^\\s*(?:static\\s+)?(?:async\\s+)?\\*?${name}\\s*[<(]`, "u");
    const lines = sourceLinesOf(options.file);
    const matches: number[] = [];
    for (const [index, line] of lines.entries()) {
        const isDeclaration = functionPattern.test(line) || methodPattern.test(line);
        if (isDeclaration) {
            matches.push(index + 1);
        }
    }
    const [only] = matches;
    const isUnique = matches.length === 1;
    if (isUnique) {
        return String(only);
    }
    return UNKNOWN_LINE;
}

/** A function's name and location as the report writes them, with the repository's own lines read from source. */
function labelOf(cost: FunctionCost) {
    const isNative = cost.location.startsWith(NATIVE_PREFIX);
    const isGenerated = isNative && cost.functionName.length === 0;
    if (isGenerated) {
        return GENERATED_LABEL;
    }
    let name = cost.functionName;
    if (name.length === 0) {
        name = ANONYMOUS_NAME;
    }
    const isDependency = cost.location.startsWith(DEPENDENCY_PREFIX);
    const isOwnSource = !isNative && !isDependency;
    if (isOwnSource) {
        const file = cost.location.slice(0, cost.location.lastIndexOf(":"));
        const line = declarationLineOf({ file, functionName: cost.functionName });
        return `${name} ${file}:${line}`;
    }
    return `${name} ${cost.location}`;
}

/** The report's rows for one summary's functions and files, each amount written by `format`. */
function costRows(options: {
    readonly functions: readonly FunctionCost[];
    readonly files: readonly FileCost[];
    readonly whole: number;
    readonly unit: string;
    readonly format: (amount: number) => string;
}) {
    const { functions, files, whole, unit, format } = options;
    const amountHeading = "self".padStart(AMOUNT_COLUMN_WIDTH);
    const shareHeading = "self".padStart(SHARE_COLUMN_WIDTH);
    const totalAmountHeading = "total".padStart(AMOUNT_COLUMN_WIDTH);
    const totalShareHeading = "total".padStart(SHARE_COLUMN_WIDTH);
    const lines = [`  ${amountHeading} ${shareHeading} ${totalAmountHeading} ${totalShareHeading}  function (${unit})`];
    for (const cost of functions.slice(0, FUNCTION_ROW_COUNT)) {
        const selfShare = formatShare({ part: cost.self, whole });
        const totalShare = formatShare({ part: cost.total, whole });
        const label = labelOf(cost);
        lines.push(`  ${format(cost.self)} ${selfShare} ${format(cost.total)} ${totalShare}  ${label}`);
    }
    lines.push(`  ${amountHeading} ${shareHeading}  file (${unit})`);
    for (const cost of files.slice(0, FILE_ROW_COUNT)) {
        const selfShare = formatShare({ part: cost.self, whole });
        lines.push(`  ${format(cost.self)} ${selfShare}  ${cost.location}`);
    }
    return lines;
}

function cpuReport() {
    const names = readdirSync(CPU_PROFILE_DIRECTORY);
    assertSchema(names, cpuProfileNamesSchema, `The CPU run wrote ${names.length} profiles, not one.`);
    const [name] = names;
    const text = readFileSync(new URL(name, CPU_PROFILE_DIRECTORY), { encoding: ENCODING });
    const profile: unknown = JSON.parse(text);
    assertSchema(profile, cpuProfileSchema, `${name} is not a CPU profile.`);
    const lines: string[] = [];
    for (const rootName of workloadNames) {
        const summary = summarizeProfile({ profile, rootName, rootUrl: REPOSITORY_URL.href });
        const wholeMicroseconds = summary.rootMicroseconds + summary.garbageCollectionMicroseconds;
        const garbageShare = formatShare({ part: summary.garbageCollectionMicroseconds, whole: wholeMicroseconds });
        lines.push(
            `== CPU ${rootName}: ${formatMilliseconds(summary.rootMicroseconds).trim()} ms JavaScript, ${formatMilliseconds(summary.garbageCollectionMicroseconds).trim()} ms garbage collection (${garbageShare.trim()} of the window)`,
        );
        const rows = costRows({ functions: summary.functions, files: summary.files, whole: summary.rootMicroseconds, unit: "ms", format: formatMilliseconds });
        for (const row of rows) {
            lines.push(row);
        }
        lines.push("");
    }
    return lines;
}

function heapReport() {
    const lines: string[] = [];
    for (const rootName of workloadNames) {
        const path = new URL(`${rootName}.heapprofile`, HEAP_PROFILE_DIRECTORY);
        const text = readFileSync(path, { encoding: ENCODING });
        const profile: unknown = JSON.parse(text);
        assertSchema(profile, heapProfileSchema, `${rootName}.heapprofile is not a heap profile.`);
        const summary = summarizeHeapProfile({ profile, rootUrl: REPOSITORY_URL.href });
        lines.push(`== Allocation ${rootName}: ${formatMebibytes(summary.totalBytes).trim()} MiB sampled`);
        const rows = costRows({ functions: summary.functions, files: summary.files, whole: summary.totalBytes, unit: "MiB", format: formatMebibytes });
        for (const row of rows) {
            lines.push(row);
        }
        lines.push("");
    }
    return lines;
}

const cpuProfileNamesSchema = z.tuple([z.string().endsWith(".cpuprofile")]);

rmSync(PROFILES_DIRECTORY, { recursive: true, force: true });
mkdirSync(CPU_PROFILE_DIRECTORY, { recursive: true });
const cpuStatus = runVitest({
    workloadPath: CPU_WORKLOAD_PATH,
    execArgv: ["--cpu-prof", `--cpu-prof-dir=${fileURLToPath(CPU_PROFILE_DIRECTORY)}`, `--cpu-prof-interval=${CPU_SAMPLING_INTERVAL_MICROSECONDS}`],
});
const heapStatus = runVitest({ workloadPath: HEAP_WORKLOAD_PATH, execArgv: [] });
const isCpuRunPassed = cpuStatus === 0;
const isEveryRunPassed = isCpuRunPassed && heapStatus === 0;
if (isEveryRunPassed) {
    const report = [...cpuReport(), ...heapReport()].join("\n");
    writeFileSync(REPORT_PATH, report, { encoding: ENCODING });
    console.log(report);
} else {
    console.error(`A profiling run failed: the CPU run exited ${cpuStatus}, the heap run ${heapStatus}.`);
    process.exitCode = 1;
}
