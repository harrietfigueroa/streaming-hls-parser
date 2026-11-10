// Samples every allocation each workload makes, collected objects included, and
// writes one heap profile per workload for `npm run profile` to summarize.
// Node's --heap-prof writes its profile at exit, which holds only the objects
// still alive then, so this samples through node:inspector around each workload.
import { mkdirSync, writeFileSync } from "node:fs";
import { Session } from "node:inspector/promises";

import { afterAll, beforeAll, test } from "vitest";

import { warmUp, workloads } from "./workloads.js";

const HEAP_PROFILE_DIRECTORY = new URL("../../.profiles/heap/", import.meta.url);
const ENCODING = "utf8";
// One sample per 32 KiB allocated on average, V8's default interval.
const SAMPLING_INTERVAL_BYTES = 32 * 1024;
const WORKLOAD_TIMEOUT_MS = 120_000;
const testOptions = { timeout: WORKLOAD_TIMEOUT_MS } as const;
const samplingOptions = {
    samplingInterval: SAMPLING_INTERVAL_BYTES,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
} as const;

const session = new Session();

async function connect() {
    session.connect();
    await session.post("HeapProfiler.enable");
}

async function disconnect() {
    await session.post("HeapProfiler.disable");
    session.disconnect();
}

beforeAll(connect);
afterAll(disconnect);

test("warm up", testOptions, warmUp);

function sampleWorkload(workload: (typeof workloads)[number]) {
    async function sample() {
        await session.post("HeapProfiler.startSampling", samplingOptions);
        await workload();
        const { profile } = await session.post("HeapProfiler.stopSampling");
        mkdirSync(HEAP_PROFILE_DIRECTORY, { recursive: true });
        const path = new URL(`${workload.name}.heapprofile`, HEAP_PROFILE_DIRECTORY);
        const json = JSON.stringify(profile);
        writeFileSync(path, json, { encoding: ENCODING });
    }
    return sample;
}

for (const workload of workloads) {
    test(workload.name, testOptions, sampleWorkload(workload));
}
