// These tests pin section 4.3 substitution as section 6.3.1 specifies it: each
// Variable Reference whose name is defined is replaced, replacements are not
// substituted again, and a reference to an undefined name is a parse error.
// Text that only resembles a reference is left as written.
import { describe, expect, test } from "vitest";

import { substituteVariables, SubstitutionKind } from "../../src/4-playlists/4.3-variable-substitution.js";
import { generalClientRules } from "../../src/6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";

const BYTES_MAX = 64;

const variables: ReadonlyMap<string, string> = new Map([
    ["host", "example.com"],
    ["id", "42"],
    ["empty", ""],
    ["nested", "{$id}"],
    ["long_value-1", "x".repeat(BYTES_MAX)],
]);

const substitutedCases = [
    { text: "https://{$host}/segment.ts", value: "https://example.com/segment.ts" },
    { text: "{$id}-{$id}.ts", value: "42-42.ts" },
    { text: "a{$empty}b", value: "ab" },
    { text: "{$nested}", value: "{$id}" },
    { text: "segment.ts", value: "segment.ts" },
    { text: "{$host", value: "{$host" },
    { text: "{$not a name}", value: "{$not a name}" },
    { text: "{$}", value: "{$}" },
    { text: "${host}", value: "${host}" },
] as const;

describe("substituteVariables", () => {
    test.each(substitutedCases)("substitutes $text", ({ text, value }) => {
        const outcome = substituteVariables({ text, variables, bytesMax: BYTES_MAX });
        expect(outcome).toEqual({ kind: SubstitutionKind.substituted, value });
    });

    test("reports a reference to an undefined name as malformed", () => {
        const outcome = substituteVariables({ text: "{$missing}.ts", variables, bytesMax: BYTES_MAX });
        expect(outcome).toMatchObject({
            kind: SubstitutionKind.malformed,
            issue: { rule: generalClientRules.definedVariableReferences },
        });
    });

    test("treats Variable Names as case-sensitive", () => {
        const outcome = substituteVariables({ text: "{$HOST}", variables, bytesMax: BYTES_MAX });
        expect(outcome).toMatchObject({ kind: SubstitutionKind.malformed });
    });

    test("reports a result longer than the limit", () => {
        const outcome = substituteVariables({ text: "a{$long_value-1}", variables, bytesMax: BYTES_MAX });
        expect(outcome).toEqual({ kind: SubstitutionKind.limitExceeded, bytesMax: BYTES_MAX });
    });

    // Each U+00E9 is one UTF-16 code unit and two UTF-8 bytes.
    test("counts the result's UTF-8 bytes against the limit", () => {
        const E_ACUTE_BYTES = 2;
        const halfLimit = "é".repeat(Math.floor(BYTES_MAX / E_ACUTE_BYTES));
        const outcome = substituteVariables({ text: `${halfLimit}x`, variables, bytesMax: BYTES_MAX });
        expect(outcome).toEqual({ kind: SubstitutionKind.limitExceeded, bytesMax: BYTES_MAX });
    });

    test("accepts a result exactly at the limit", () => {
        const outcome = substituteVariables({ text: "{$long_value-1}", variables, bytesMax: BYTES_MAX });
        expect(outcome).toMatchObject({ kind: SubstitutionKind.substituted });
    });
});
