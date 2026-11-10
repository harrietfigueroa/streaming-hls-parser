// These tests pin the heap profile summary against small hand-built profiles in
// V8's sampling heap profile shape: each node's sampled bytes are its function's
// self bytes, and count toward the total bytes of every distinct function on its
// path from the profile's root, once even where a function recurses. A frame's
// location is relative to the repository whether V8 gives it a URL or a path.
import { describe, expect, test } from "vitest";

import { type HeapProfile, summarizeHeapProfile } from "../../scripts/heap-profile.js";

const ROOT_URL = "file:///repo/";

function frameOf(options: { readonly functionName: string; readonly url: string; readonly lineNumber: number }) {
    return { ...options, scriptId: "1", columnNumber: 0 };
}

// The tree: (root) → work → { scan → work, convert }, where work recurses beneath scan.
const profile: HeapProfile = {
    head: {
        id: 1,
        callFrame: frameOf({ functionName: "(root)", url: "", lineNumber: -1 }),
        selfSize: 0,
        children: [
            {
                id: 2,
                callFrame: frameOf({ functionName: "work", url: "file:///repo/bench/profile/workloads.ts", lineNumber: 5 }),
                selfSize: 100,
                children: [
                    {
                        id: 3,
                        callFrame: frameOf({ functionName: "scan", url: "/repo/src/library/scan.ts", lineNumber: 20 }),
                        selfSize: 300,
                        children: [
                            {
                                id: 4,
                                callFrame: frameOf({ functionName: "work", url: "file:///repo/bench/profile/workloads.ts", lineNumber: 5 }),
                                selfSize: 50,
                                children: [],
                            },
                        ],
                    },
                    {
                        id: 5,
                        callFrame: frameOf({ functionName: "convert", url: "file:///repo/src/library/create-hls.ts", lineNumber: 30 }),
                        selfSize: 200,
                        children: [],
                    },
                ],
            },
        ],
    },
};

describe("summarizeHeapProfile", () => {
    const summary = summarizeHeapProfile({ profile, rootUrl: ROOT_URL });

    test("sums every node's sampled bytes", () => {
        expect(summary.totalBytes).toBe(650);
    });

    test("ranks functions by self bytes, counting a recursive function's total once per node", () => {
        expect(summary.functions).toStrictEqual([
            { functionName: "scan", location: "src/library/scan.ts:21", self: 300, total: 350 },
            { functionName: "convert", location: "src/library/create-hls.ts:31", self: 200, total: 200 },
            { functionName: "work", location: "bench/profile/workloads.ts:6", self: 150, total: 650 },
        ]);
    });

    test("sums self bytes by file, ranked", () => {
        expect(summary.files).toStrictEqual([
            { location: "src/library/scan.ts", self: 300 },
            { location: "src/library/create-hls.ts", self: 200 },
            { location: "bench/profile/workloads.ts", self: 150 },
        ]);
    });
});
