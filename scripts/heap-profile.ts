// Summarizes a V8 sampling heap profile, the result of HeapProfiler.stopSampling.
// This module is pure: it takes the parsed profile and returns which functions
// allocated the sampled bytes. A profile sampled with collected objects included
// counts every allocation, the garbage a parse leaves among them.
//
// A node's sampled bytes are its function's self bytes, and count toward the
// total bytes of every distinct function on its path from the profile's root.
import { z } from "zod";

import { assertCondition } from "../src/library/assert.ts";
import { type CallFrame, callFrameSchema, keyOf, rankCosts, sumWith } from "./profile-ranking.ts";

// A sampling profile holds one node per distinct allocating stack, far below this.
const NODE_COUNT_MAX = 10_000_000;

type HeapNode = {
    readonly id: number;
    readonly callFrame: CallFrame;
    readonly selfSize: number;
    readonly children: readonly HeapNode[];
};

const heapNodeSchema: z.ZodType<HeapNode> = z.object({
    id: z.int(),
    callFrame: callFrameSchema,
    selfSize: z.number(),
    get children() {
        return z.array(heapNodeSchema);
    },
});

/** The parts of V8's sampling heap profile format the summary reads. */
export const heapProfileSchema = z.object({ head: heapNodeSchema });

export type HeapProfile = z.infer<typeof heapProfileSchema>;

/** Yields each node of the tree under `head` but `head` itself, with the keys of its path from `head`, leaf last. */
function* nodesWithPathsOf(options: { readonly head: HeapNode; readonly rootUrl: string }) {
    const { head, rootUrl } = options;
    const pending: { readonly node: HeapNode; readonly path: readonly string[] }[] = [];
    for (const child of head.children) {
        pending.push({ node: child, path: [] });
    }
    let visitedCount = 0;
    // Each node enters `pending` once, so the loop is bounded by the node count.
    for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
        visitedCount += 1;
        assertCondition(visitedCount <= NODE_COUNT_MAX, `The heap profile has more than ${NODE_COUNT_MAX} nodes.`);
        const key = keyOf({ callFrame: next.node.callFrame, rootUrl });
        const path = [...next.path, key];
        yield { node: next.node, path };
        for (const child of next.node.children) {
            pending.push({ node: child, path });
        }
    }
}

/**
 * Which functions allocated the sampled bytes in `profile`: the bytes in all, and self and total
 * bytes by function and self bytes by file, each ranked highest first. File locations are relative
 * to `rootUrl`.
 */
export function summarizeHeapProfile(options: { readonly profile: HeapProfile; readonly rootUrl: string }) {
    const { profile, rootUrl } = options;
    const selfs = new Map<string, number>();
    const totals = new Map<string, number>();
    const callFrames: CallFrame[] = [];
    let totalBytes = 0;
    for (const { node, path } of nodesWithPathsOf({ head: profile.head, rootUrl })) {
        callFrames.push(node.callFrame);
        const leaf = path[path.length - 1];
        assertCondition(leaf !== undefined, `Node ${node.id} has an empty path.`);
        totalBytes += node.selfSize;
        const self = sumWith({ sums: selfs, key: leaf, amount: node.selfSize });
        selfs.set(leaf, self);
        for (const key of new Set(path)) {
            const total = sumWith({ sums: totals, key, amount: node.selfSize });
            totals.set(key, total);
        }
    }
    const { functions, files } = rankCosts({ callFrames, rootUrl, selfs, totals });
    return { totalBytes, functions, files };
}
