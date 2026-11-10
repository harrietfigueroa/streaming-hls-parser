// Assertions detect programmer errors and must crash. Every failure throws an
// AssertionError, so a caught failure is distinguishable from an operating error.
import { z } from "zod";

const SCHEMA_MESSAGE_DEFAULT = "Value does not match schema.";
const UNREACHABLE_MESSAGE_DEFAULT = "Reached code that the type system marks unreachable.";

/** Thrown by every assertion helper when its invariant does not hold. */
export class AssertionError extends Error {
    override readonly name = "AssertionError";
}

/** Returns when `condition` is truthy, and throws an AssertionError carrying `message` otherwise. */
export function assertCondition(condition: unknown, message: string): asserts condition {
    if (condition) {
        return;
    }
    throw new AssertionError(message);
}

/**
 * Returns when `value` matches `schema`, narrowing it to the schema's output type, and throws an
 * AssertionError whose cause is the treeified zod error otherwise. Transforming schemas are not
 * supported: an assertion narrows its argument and cannot hand back a transformed value.
 */
export function assertSchema<S extends z.ZodType>(
    value: unknown,
    schema: Readonly<S>,
    message: string = SCHEMA_MESSAGE_DEFAULT,
): asserts value is z.infer<S> {
    const result = schema.safeParse(value);
    if (result.success) {
        return;
    }
    const cause = z.treeifyError(result.error);
    throw new AssertionError(message, { cause });
}

/** Throws an AssertionError; the `never` parameter makes reaching a call a compile error first. */
export function unreachable(value: never, message: string = UNREACHABLE_MESSAGE_DEFAULT): never {
    throw new AssertionError(`${message} Value: ${String(value)}`);
}
