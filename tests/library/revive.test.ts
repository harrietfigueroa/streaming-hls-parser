// These tests pin revive against JSON.parse's own reviver walk: for the same
// tree, revive calls the reviver with the same holders, keys, and values in
// the same order, and removes the same properties, so a reviver written for
// JSON.parse runs unchanged.
import { describe, expect, test } from "vitest";

import { assertCondition } from "../../src/library/assert.js";
import { revive } from "../../src/library/revive.js";

const tree = { name: "media", segments: [{ uri: "a.ts", keys: [] }, { uri: "b.ts", keys: [{ URI: "k" }] }], ignored: [] } as const;

type Call = { readonly holderKeys: readonly string[]; readonly key: string; readonly value: string };

function recordCalls(run: (reviver: (this: unknown, key: string, value: unknown) => unknown) => unknown) {
    const calls: Call[] = [];
    function recordingReviver(this: unknown, key: string, value: unknown) {
        let holderKeys: string[] = [];
        const isHolderObject = typeof this === "object" && this !== null;
        if (isHolderObject) {
            holderKeys = Object.keys(this);
        }
        calls.push({ holderKeys, key, value: JSON.stringify(value) });
        return value;
    }
    run(recordingReviver);
    return calls;
}

function removeUris(this: unknown, key: string, value: unknown) {
    if (key === "uri") {
        return undefined;
    }
    return value;
}

function removeFirstSegment(this: unknown, key: string, value: unknown) {
    const isFirstIndex = key === "0" && Array.isArray(this);
    if (isFirstIndex) {
        return undefined;
    }
    return value;
}

function upperCaseStrings(this: unknown, _key: string, value: unknown) {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    return value;
}

describe("revive", () => {
    test("calls the reviver as JSON.parse does, children before parents, ending with the root", () => {
        const text = JSON.stringify(tree);
        function parseWithJson(reviver: (this: unknown, key: string, value: unknown) => unknown) {
            return JSON.parse(text, reviver);
        }
        function parseWithRevive(reviver: (this: unknown, key: string, value: unknown) => unknown) {
            return revive({ value: tree, reviver });
        }
        const expected = recordCalls(parseWithJson);
        expect(recordCalls(parseWithRevive)).toEqual(expected);
    });

    const revivers = [
        { name: "removes each property the reviver returns undefined for", reviver: removeUris },
        { name: "leaves a hole where the reviver returns undefined for an element", reviver: removeFirstSegment },
        { name: "replaces each value with the reviver's return", reviver: upperCaseStrings },
    ] as const;

    test.each(revivers)("$name", ({ reviver }) => {
        const expected: unknown = JSON.parse(JSON.stringify(tree), reviver);
        expect(revive({ value: tree, reviver })).toStrictEqual(expected);
    });

    test("freezes the objects and arrays it builds", () => {
        const revived = revive({ value: tree, reviver: upperCaseStrings });
        expect(revived).toMatchObject({ segments: [{ uri: "A.TS" }, { uri: "B.TS" }] });
        assertCondition(typeof revived === "object", "The revived tree is not an object.");
        assertCondition(revived !== null, "The revived tree is null.");
        assertCondition("segments" in revived, "The revived tree has no segments.");
        expect(Object.isFrozen(revived)).toBe(true);
        expect(Object.isFrozen(revived.segments)).toBe(true);
    });

    test("passes a Map through as one value", () => {
        const variables = new Map([["host", "example.com"]]);
        const revived = revive({ value: { variables }, reviver: upperCaseStrings });
        expect(revived).toEqual({ variables });
    });
});
