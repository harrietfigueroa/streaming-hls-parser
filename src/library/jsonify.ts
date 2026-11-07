// The JSON form of parsed output. This module is pure: it copies a parsed
// value's own enumerable data, writing each bigint as its decimal string,
// since JSON.stringify throws on a bigint, and leaving every other value as it
// is. A Map, the one non-plain object in parsed output, is a value it keeps.
import { assertCondition } from "./assert.js";

type Method = (...parameters: never[]) => unknown;

/** `T` as toJSON returns it: each bigint a decimal string, and methods left out. */
export type Jsonified<T> = T extends bigint
    ? string
    : T extends ReadonlyMap<unknown, unknown>
      ? T
      : T extends readonly (infer Element)[]
        ? readonly Jsonified<Element>[]
        : T extends object
          ? { readonly [Key in keyof T as T[Key] extends Method ? never : Key]: Jsonified<T[Key]> }
          : T;

// Parsed output nests a handful of levels; the bound only has to exceed the deepest of them.
const DEPTH_MAX = 32;

function jsonifyAt(value: unknown, depth: number): unknown {
    assertCondition(depth < DEPTH_MAX, `The JSON walk reached depth ${depth}, past ${DEPTH_MAX}.`);
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (Array.isArray(value)) {
        const elements: unknown[] = [];
        for (const element of value) {
            const jsonified = jsonifyAt(element, depth + 1);
            elements.push(jsonified);
        }
        return elements;
    }
    const isObject = typeof value === "object" && value !== null;
    const isWalked = isObject && !(value instanceof Map);
    if (!isWalked) {
        return value;
    }
    const fields: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(value)) {
        fields[key] = jsonifyAt(field, depth + 1);
    }
    return fields;
}

/** Copies `value`'s data with each bigint written as its decimal string. */
export function jsonify<T>(value: T): Jsonified<T>;
export function jsonify(value: unknown) {
    return jsonifyAt(value, 0);
}
