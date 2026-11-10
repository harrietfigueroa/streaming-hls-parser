// Names and ranks the functions in a V8 profile. This module is pure, and holds
// what the CPU and heap summaries share: the call frame both formats carry, the
// key and location that identify a function, and the ranking of self and total
// cost by function and by file, in whichever unit the summary measures.
import { z } from "zod";
import { fileURLToPath } from "node:url";

import { assertCondition } from "../src/library/assert.ts";

const NATIVE_LOCATION = "(native)";

/** The call frame V8's CPU and heap profiles both give each node. */
export const callFrameSchema = z.object({
    functionName: z.string(),
    scriptId: z.string(),
    url: z.string(),
    lineNumber: z.int(),
    columnNumber: z.int(),
});

export type CallFrame = z.infer<typeof callFrameSchema>;

/** One function's cost: its own, and its own with everything it called, in the summary's unit. */
export type FunctionCost = {
    readonly functionName: string;
    readonly location: string;
    readonly self: number;
    readonly total: number;
};

/** One file's self cost, in the summary's unit. */
export type FileCost = { readonly location: string; readonly self: number };

/** A frame's file relative to `rootUrl`, which V8 gives as a file URL or, for some modules, as a bare path. */
function fileOf(options: { readonly url: string; readonly rootUrl: string }) {
    const { url, rootUrl } = options;
    if (url.length === 0) {
        return NATIVE_LOCATION;
    }
    if (url.startsWith(rootUrl)) {
        return url.slice(rootUrl.length);
    }
    const rootPath = fileURLToPath(rootUrl);
    if (url.startsWith(rootPath)) {
        return url.slice(rootPath.length);
    }
    return url;
}

/** A frame's file, relative to `rootUrl`, and its one-based line. */
function locationOf(options: { readonly callFrame: CallFrame; readonly rootUrl: string }) {
    const { callFrame, rootUrl } = options;
    const file = fileOf({ url: callFrame.url, rootUrl });
    return `${file}:${callFrame.lineNumber + 1}`;
}

/** The key identifying a frame's function: its name and its location. */
export function keyOf(options: { readonly callFrame: CallFrame; readonly rootUrl: string }) {
    const location = locationOf(options);
    return `${options.callFrame.functionName} ${location}`;
}

/** The sum `sums` holds for `key` with `amount` added, zero being the sum of a key it lacks. */
export function sumWith(options: { readonly sums: ReadonlyMap<string, number>; readonly key: string; readonly amount: number }) {
    const { sums, key, amount } = options;
    let sum = amount;
    const previous = sums.get(key);
    if (previous !== undefined) {
        sum += previous;
    }
    return sum;
}

function compareFunctionCosts(left: FunctionCost, right: FunctionCost) {
    const selfOrder = right.self - left.self;
    if (selfOrder !== 0) {
        return selfOrder;
    }
    const totalOrder = right.total - left.total;
    if (totalOrder !== 0) {
        return totalOrder;
    }
    return left.location.localeCompare(right.location);
}

function compareFileCosts(left: FileCost, right: FileCost) {
    const selfOrder = right.self - left.self;
    if (selfOrder !== 0) {
        return selfOrder;
    }
    return left.location.localeCompare(right.location);
}

/**
 * Ranks each function in `totals` by its self and total cost, and sums self cost by file, both
 * highest first. `callFrames` names every key the two maps hold.
 */
export function rankCosts(options: {
    readonly callFrames: Iterable<CallFrame>;
    readonly rootUrl: string;
    readonly selfs: ReadonlyMap<string, number>;
    readonly totals: ReadonlyMap<string, number>;
}) {
    const { rootUrl, selfs, totals } = options;
    const identities = new Map<string, { readonly functionName: string; readonly file: string; readonly location: string }>();
    for (const callFrame of options.callFrames) {
        const key = keyOf({ callFrame, rootUrl });
        const file = fileOf({ url: callFrame.url, rootUrl });
        const location = locationOf({ callFrame, rootUrl });
        identities.set(key, { functionName: callFrame.functionName, file, location });
    }
    const functions: FunctionCost[] = [];
    const fileCosts = new Map<string, number>();
    for (const [key, total] of totals) {
        const identity = identities.get(key);
        assertCondition(identity !== undefined, `Function ${key} has no frame.`);
        let self = 0;
        const ownCost = selfs.get(key);
        if (ownCost !== undefined) {
            self = ownCost;
            const fileCost = sumWith({ sums: fileCosts, key: identity.file, amount: ownCost });
            fileCosts.set(identity.file, fileCost);
        }
        functions.push({ functionName: identity.functionName, location: identity.location, self, total });
    }
    functions.sort(compareFunctionCosts);
    const files: FileCost[] = [];
    for (const [location, self] of fileCosts) {
        files.push({ location, self });
    }
    files.sort(compareFileCosts);
    return { functions, files };
}
