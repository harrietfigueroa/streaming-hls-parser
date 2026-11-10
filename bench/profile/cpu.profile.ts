// Runs every workload once, in one process, for the CPU profile `npm run profile`
// takes through Vitest's --execArgv=--cpu-prof. The summary finds each workload
// by its function's name, so this file only runs them in order.
import { test } from "vitest";

import { warmUp, workloads } from "./workloads.js";

const WORKLOAD_TIMEOUT_MS = 120_000;
const testOptions = { timeout: WORKLOAD_TIMEOUT_MS } as const;

test("warm up", testOptions, warmUp);

for (const workload of workloads) {
    test(workload.name, testOptions, workload);
}
