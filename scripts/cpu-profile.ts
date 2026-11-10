// Summarizes a V8 CPU profile, the .cpuprofile file `node --cpu-prof` writes.
// This module is pure: it takes the parsed profile and returns where the time
// went in one named root function's window, so a profile of a test process
// reports the workload alone and not the runner around it.
//
// The workload is the window from the first sample with the root on its stack to
// the last, which counts an async continuation that resumes outside the root's
// stack; each workload runs alone in its process, so nothing else lies in its
// window. A sample's duration is the time delta of the sample after it, so the
// last sample counts none. A sample's leaf function gets its duration as self
// time, and every distinct function on its stack, up to the outermost root frame
// where the root is on it, gets it as total time. Garbage collection is counted
// apart, and idle and program samples, which run no JavaScript, are left out.
import { z } from "zod";

import { assertCondition } from "../src/library/assert.ts";
import { callFrameSchema, keyOf, rankCosts, sumWith } from "./profile-ranking.ts";

const GARBAGE_COLLECTOR_NAME = "(garbage collector)";
const uncountedNames = new Set(["(idle)", "(program)"]);

const profileNodeSchema = z.object({
    id: z.int(),
    callFrame: callFrameSchema,
    hitCount: z.int().optional(),
    children: z.array(z.int()).optional(),
});

/** The parts of V8's .cpuprofile format the summary reads. */
export const cpuProfileSchema = z.object({
    nodes: z.array(profileNodeSchema),
    startTime: z.number(),
    endTime: z.number(),
    samples: z.array(z.int()),
    timeDeltas: z.array(z.number()),
});

export type CpuProfile = z.infer<typeof cpuProfileSchema>;
type ProfileNode = CpuProfile["nodes"][number];

/** Yields each sample's node with its time and duration, the duration being the next sample's time delta. */
function* timedSamplesOf(profile: CpuProfile) {
    let time = profile.startTime;
    for (const [index, nodeId] of profile.samples.entries()) {
        const delta = profile.timeDeltas[index];
        assertCondition(delta !== undefined, `Sample ${index} has no time delta.`);
        time += delta;
        let duration = 0;
        const nextDelta = profile.timeDeltas[index + 1];
        if (nextDelta !== undefined) {
            duration = nextDelta;
        }
        yield { nodeId, time, duration };
    }
}

/** Maps each node's id to its parent's id; the profile's root has none. */
function parentsOf(nodes: readonly ProfileNode[]) {
    const parents = new Map<number, number>();
    for (const node of nodes) {
        if (node.children === undefined) {
            continue;
        }
        for (const child of node.children) {
            assertCondition(!parents.has(child), `Node ${child} has two parents.`);
            parents.set(child, node.id);
        }
    }
    return parents;
}

function callFrameOf(node: ProfileNode) {
    return node.callFrame;
}

/**
 * Where the time went in the window of the function named `rootName` in `profile`, in
 * microseconds: the window's JavaScript time, the garbage collection inside it, and self and total
 * time by function and self time by file, each ranked longest first. File locations are relative
 * to `rootUrl`.
 */
export function summarizeProfile(options: { readonly profile: CpuProfile; readonly rootName: string; readonly rootUrl: string }) {
    const { profile, rootName, rootUrl } = options;
    assertCondition(profile.samples.length === profile.timeDeltas.length, `${profile.samples.length} samples have ${profile.timeDeltas.length} time deltas.`);
    const nodes = new Map<number, ProfileNode>();
    for (const node of profile.nodes) {
        nodes.set(node.id, node);
    }
    const parents = parentsOf(profile.nodes);
    // Each node's stack keys, leaf first, up to its outermost root frame or the profile's own root.
    const stacks = new Map<number, { readonly keys: readonly string[]; readonly isBeneathRoot: boolean }>();
    function stackOf(nodeId: number) {
        const cached = stacks.get(nodeId);
        if (cached !== undefined) {
            return cached;
        }
        const keys: string[] = [];
        let rootDepth = 0;
        let current = nodeId;
        let parent = parents.get(current);
        // A parent chain visits each node once, so its length is bounded by the node count.
        while (parent !== undefined) {
            assertCondition(keys.length <= nodes.size, `Node ${nodeId}'s parent chain is longer than the profile.`);
            const node = nodes.get(current);
            assertCondition(node !== undefined, `Sample node ${current} is not in the profile.`);
            keys.push(keyOf({ callFrame: node.callFrame, rootUrl }));
            if (node.callFrame.functionName === rootName) {
                rootDepth = keys.length;
            }
            current = parent;
            parent = parents.get(current);
        }
        const isBeneathRoot = rootDepth > 0;
        let stack = { keys, isBeneathRoot };
        if (isBeneathRoot) {
            stack = { keys: keys.slice(0, rootDepth), isBeneathRoot };
        }
        stacks.set(nodeId, stack);
        return stack;
    }

    const samples = Array.from(timedSamplesOf(profile));
    let firstRootTime = Number.POSITIVE_INFINITY;
    let lastRootTime = Number.NEGATIVE_INFINITY;
    for (const sample of samples) {
        if (stackOf(sample.nodeId).isBeneathRoot) {
            firstRootTime = Math.min(firstRootTime, sample.time);
            lastRootTime = Math.max(lastRootTime, sample.time);
        }
    }

    const selfs = new Map<string, number>();
    const totals = new Map<string, number>();
    let rootMicroseconds = 0;
    let garbageCollectionMicroseconds = 0;
    for (const { nodeId, time, duration } of samples) {
        const isBeforeWindow = time < firstRootTime;
        const isOutsideWindow = isBeforeWindow || time > lastRootTime;
        if (isOutsideWindow) {
            continue;
        }
        const node = nodes.get(nodeId);
        assertCondition(node !== undefined, `Sample node ${nodeId} is not in the profile.`);
        const { functionName } = node.callFrame;
        if (functionName === GARBAGE_COLLECTOR_NAME) {
            garbageCollectionMicroseconds += duration;
            continue;
        }
        if (uncountedNames.has(functionName)) {
            continue;
        }
        const { keys } = stackOf(nodeId);
        const [leaf] = keys;
        assertCondition(leaf !== undefined, `Sample node ${nodeId} is the profile's own root.`);
        rootMicroseconds += duration;
        const self = sumWith({ sums: selfs, key: leaf, amount: duration });
        selfs.set(leaf, self);
        for (const key of new Set(keys)) {
            const total = sumWith({ sums: totals, key, amount: duration });
            totals.set(key, total);
        }
    }
    const callFrames = Array.from(profile.nodes, callFrameOf);
    const { functions, files } = rankCosts({ callFrames, rootUrl, selfs, totals });
    return { rootMicroseconds, garbageCollectionMicroseconds, functions, files };
}
