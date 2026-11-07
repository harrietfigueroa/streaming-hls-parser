// These tests pin the tag schemas' compilation: every tag schema of both
// kinds compiles under zod's strict mode, so a schema that would fall back to
// the runtime parser in the precompiled entry fails here.
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { defaultTagTables, PlaylistKind } from "../../src/library/tag-table.js";

const TablePart = { playlist: "playlist", unit: "unit" } as const;

function* tagSchemas() {
    for (const kind of Object.values(PlaylistKind)) {
        for (const part of Object.values(TablePart)) {
            const shape: Readonly<Record<string, z.ZodType>> = defaultTagTables[kind][part].shape;
            for (const [name, schema] of Object.entries(shape)) {
                yield { label: `${kind} ${part} ${name}`, schema };
            }
        }
    }
}

const schemas = Array.from(tagSchemas());

function compileStrictly(schema: z.ZodType) {
    return z.compile(schema, { strict: true });
}

describe("tag schemas", () => {
    test.each(schemas)("compile $label strictly", ({ schema }) => {
        expect(compileStrictly(schema)).not.toBe(schema);
    });
});
