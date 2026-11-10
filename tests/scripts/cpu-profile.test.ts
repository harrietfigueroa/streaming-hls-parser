// These tests pin the CPU profile summary against small hand-built profiles in
// V8's .cpuprofile shape: every sample inside the window from the root's first
// sample to its last counts, attributed to its leaf function as self time and to
// every function on its stack up to the root as total time, with garbage
// collection kept apart and idle and program samples left out.
import { describe, expect, test } from "vitest";

import { type CpuProfile, summarizeProfile } from "../../scripts/cpu-profile.js";

const ROOT_URL = "file:///repo/";

function frameOf(options: { readonly functionName: string; readonly url: string; readonly lineNumber: number }) {
    return { ...options, scriptId: "1", columnNumber: 0 };
}

// The tree: (root) → runner → work → { scan, convert }, and beside runner the garbage collector,
// an async continuation that resumes outside work's stack, and the idle and program samples.
// Each sample's duration is the next sample's time delta, so the last sample counts none.
const profile: CpuProfile = {
    nodes: [
        { id: 1, callFrame: frameOf({ functionName: "(root)", url: "", lineNumber: -1 }), children: [2, 6, 7, 8, 9] },
        { id: 2, callFrame: frameOf({ functionName: "runner", url: "file:///repo/node_modules/vitest/runner.js", lineNumber: 10 }), children: [3] },
        { id: 3, callFrame: frameOf({ functionName: "work", url: "file:///repo/bench/profile.bench.ts", lineNumber: 5 }), children: [4, 5] },
        { id: 4, callFrame: frameOf({ functionName: "scan", url: "file:///repo/src/library/scan.ts", lineNumber: 20 }) },
        { id: 5, callFrame: frameOf({ functionName: "convert", url: "file:///repo/src/library/create-hls.ts", lineNumber: 30 }) },
        { id: 6, callFrame: frameOf({ functionName: "(garbage collector)", url: "", lineNumber: -1 }) },
        { id: 7, callFrame: frameOf({ functionName: "resume", url: "file:///repo/src/library/parse-stream.ts", lineNumber: 40 }) },
        { id: 8, callFrame: frameOf({ functionName: "(idle)", url: "", lineNumber: -1 }) },
        { id: 9, callFrame: frameOf({ functionName: "(program)", url: "", lineNumber: -1 }) },
    ],
    startTime: 0,
    endTime: 110,
    samples: [2, 4, 4, 6, 7, 8, 9, 5, 3, 6, 2],
    timeDeltas: [0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
};

describe("summarizeProfile", () => {
    const summary = summarizeProfile({ profile, rootName: "work", rootUrl: ROOT_URL });

    test("counts every sample in the root's window but garbage collection, idle, and program samples", () => {
        // The window runs from sample 1 to sample 8: scan twice, resume, convert, and work.
        expect(summary.rootMicroseconds).toBe(50);
    });

    test("attributes self time to each sample's leaf, ranked by self time, then total time, then location", () => {
        expect(summary.functions).toStrictEqual([
            { functionName: "scan", location: "src/library/scan.ts:21", self: 20, total: 20 },
            { functionName: "work", location: "bench/profile.bench.ts:6", self: 10, total: 40 },
            { functionName: "convert", location: "src/library/create-hls.ts:31", self: 10, total: 10 },
            { functionName: "resume", location: "src/library/parse-stream.ts:41", self: 10, total: 10 },
        ]);
    });

    test("sums self time by file, ranked", () => {
        expect(summary.files).toStrictEqual([
            { location: "src/library/scan.ts", self: 20 },
            { location: "bench/profile.bench.ts", self: 10 },
            { location: "src/library/create-hls.ts", self: 10 },
            { location: "src/library/parse-stream.ts", self: 10 },
        ]);
    });

    test("counts garbage collection between the root's first and last samples, and none outside", () => {
        // Sample 3 lies inside the window from sample 1 to sample 8; sample 9 lies after it.
        expect(summary.garbageCollectionMicroseconds).toBe(10);
    });

    test("reports nothing for a root no sample is beneath", () => {
        const absent = summarizeProfile({ profile, rootName: "absent", rootUrl: ROOT_URL });
        expect(absent).toStrictEqual({ rootMicroseconds: 0, garbageCollectionMicroseconds: 0, functions: [], files: [] });
    });

    test("counts a recursive function's total time once per sample", () => {
        const recursive: CpuProfile = {
            nodes: [
                { id: 1, callFrame: frameOf({ functionName: "(root)", url: "", lineNumber: -1 }), children: [2] },
                { id: 2, callFrame: frameOf({ functionName: "work", url: "file:///repo/a.ts", lineNumber: 0 }), children: [3] },
                { id: 3, callFrame: frameOf({ functionName: "work", url: "file:///repo/a.ts", lineNumber: 0 }) },
            ],
            startTime: 0,
            endTime: 20,
            samples: [3, 3],
            timeDeltas: [0, 10],
        };
        const recursiveSummary = summarizeProfile({ profile: recursive, rootName: "work", rootUrl: ROOT_URL });
        expect(recursiveSummary.functions).toStrictEqual([{ functionName: "work", location: "a.ts:1", self: 10, total: 10 }]);
    });
});
