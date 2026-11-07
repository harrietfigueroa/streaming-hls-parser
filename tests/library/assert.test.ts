// These tests pin the assertion helpers' contract: each helper returns on the
// positive space, and throws an AssertionError on the negative space carrying
// the message, plus the treeified zod error as cause for schema assertions.
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { AssertionError, assertCondition, assertSchema, unreachable } from "../../src/library/assert.js";

const MESSAGE = "the invariant under test";
const UNEXPECTED_VALUE = "unexpected";

const truthyConditions = [true, 1, "text", {}, [], 1n] as const;
const falsyConditions = [false, 0, "", null, undefined, Number.NaN, 0n] as const;

const pointSchema = z.object({ x: z.number(), y: z.number() });
type Point = z.infer<typeof pointSchema>;

const validPoint: Point = { x: 1, y: 2 };
const invalidPoint = { ...validPoint, y: "two" } as const;

describe("assertCondition", () => {
    test.each(truthyConditions)("returns for the truthy condition %s", (condition) => {
        expect(() => {
            assertCondition(condition, MESSAGE);
        }).not.toThrow();
    });

    test.each(falsyConditions)("throws AssertionError for the falsy condition %s", (condition) => {
        expect(() => {
            assertCondition(condition, MESSAGE);
        }).toThrow(AssertionError);
    });

    test("carries the message on failure", () => {
        expect(() => {
            assertCondition(false, MESSAGE);
        }).toThrow(MESSAGE);
    });
});

describe("assertSchema", () => {
    test("returns for a value matching the schema", () => {
        expect(() => {
            assertSchema(validPoint, pointSchema, MESSAGE);
        }).not.toThrow();
    });

    test("throws AssertionError for a value not matching the schema", () => {
        expect(() => {
            assertSchema(invalidPoint, pointSchema, MESSAGE);
        }).toThrow(AssertionError);
    });

    test("carries the given message on failure", () => {
        expect(() => {
            assertSchema(invalidPoint, pointSchema, MESSAGE);
        }).toThrow(MESSAGE);
    });

    test("sets the treeified zod error as cause", () => {
        const result = pointSchema.safeParse(invalidPoint);
        if (result.success) {
            expect.unreachable("the invalid point parsed");
            return;
        }
        const expectedCause = z.treeifyError(result.error);
        let caught: unknown;
        try {
            assertSchema(invalidPoint, pointSchema, MESSAGE);
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(AssertionError);
        expect(caught).toHaveProperty("cause", expectedCause);
    });

    test("uses a default message when none is given", () => {
        expect(() => {
            assertSchema(invalidPoint, pointSchema);
        }).toThrow(/./);
    });
});

describe("unreachable", () => {
    // A value of type never cannot be constructed, so Reflect.apply calls the
    // helper without the static check, which is the path its runtime backstop guards.
    test("throws AssertionError", () => {
        expect(() => Reflect.apply(unreachable, undefined, [UNEXPECTED_VALUE])).toThrow(AssertionError);
    });

    test("carries the given message", () => {
        expect(() => Reflect.apply(unreachable, undefined, [UNEXPECTED_VALUE, MESSAGE])).toThrow(MESSAGE);
    });
});
