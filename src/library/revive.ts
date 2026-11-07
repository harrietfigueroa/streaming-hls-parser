// The reviver walk, following JSON.parse's: the reviver is called with each
// property's holder as `this`, its key, and its value, children before parents,
// and last with the key "" on a holder of the root. Returning undefined removes
// the property, leaving a hole in an array. The walk copies each plain object
// and array it enters, since the parsed tree is frozen, and freezes each copy
// once the reviver has seen it; values the reviver returns are kept as returned.
import { assertCondition } from "./assert.js";

/** A reviver as JSON.parse takes one. */
export type Reviver = (this: unknown, key: string, value: unknown) => unknown;

// A parsed playlist nests a handful of levels; the bound only has to exceed the deepest of them.
const DEPTH_MAX = 32;
const ROOT_KEY = "";

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
    const isObject = typeof value === "object" && value !== null;
    if (!isObject) {
        return false;
    }
    const prototype: unknown = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

type WalkOptions = { readonly reviver: Reviver; readonly depth: number };

/** Revives each element of a copy of `array`, keeping a hole for each removed element. */
function reviveArray(array: readonly unknown[], options: WalkOptions) {
    const copy = Array.from(array);
    const removed = new Set<number>();
    for (let index = 0; index < copy.length; index += 1) {
        const revived = internalize({ holder: copy, key: String(index), value: copy[index], ...options });
        copy[index] = revived;
        if (revived === undefined) {
            removed.add(index);
        }
    }
    if (removed.size === 0) {
        return copy;
    }
    // An array of the copy's length whose removed indices are never assigned holds a hole at each.
    const withHoles: unknown[] = new Array<unknown>(copy.length);
    for (let index = 0; index < copy.length; index += 1) {
        if (!removed.has(index)) {
            withHoles[index] = copy[index];
        }
    }
    return withHoles;
}

/** Revives each property of a copy of `object`, leaving out each removed property. */
function reviveObject(object: Readonly<Record<string, unknown>>, options: WalkOptions) {
    const copy: Record<string, unknown> = { ...object };
    const removed = new Set<string>();
    for (const key of Object.keys(copy)) {
        const revived = internalize({ holder: copy, key, value: copy[key], ...options });
        copy[key] = revived;
        if (revived === undefined) {
            removed.add(key);
        }
    }
    if (removed.size === 0) {
        return copy;
    }
    const withoutRemoved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(copy)) {
        if (!removed.has(key)) {
            withoutRemoved[key] = value;
        }
    }
    return withoutRemoved;
}

function internalize(options: { readonly holder: object; readonly key: string; readonly value: unknown } & WalkOptions) {
    const { holder, key, value, reviver, depth } = options;
    assertCondition(depth < DEPTH_MAX, `The reviver walk reached depth ${depth}, past ${DEPTH_MAX}.`);
    const childOptions = { reviver, depth: depth + 1 };
    let walked: unknown = value;
    if (Array.isArray(value)) {
        walked = reviveArray(value, childOptions);
    } else if (isPlainObject(value)) {
        walked = reviveObject(value, childOptions);
    }
    const revived = reviver.call(holder, key, walked);
    if (walked !== value) {
        Object.freeze(walked);
    }
    return revived;
}

/** Runs `reviver` over `value` as JSON.parse runs it over its parsed text, returning the revived root. */
export function revive(options: { readonly value: unknown; readonly reviver: Reviver }) {
    const holder = { [ROOT_KEY]: options.value };
    return internalize({ holder, key: ROOT_KEY, value: options.value, reviver: options.reviver, depth: 0 });
}
