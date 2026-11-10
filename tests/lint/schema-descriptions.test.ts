// These tests pin the runtime half of hls/schema-spec-link: every schema a
// spec section module exports reports, through zod's .description, a link to
// the section its file is named for. Each module is found by glob and imported,
// so a new section module is covered without a change here.
import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";
import { z } from "zod";

const SPEC_LINK_PREFIX = "https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-";
const SCHEMA_NAME_PATTERN = /Schema$/;
const SECTION_PATTERN = /\/(\d+(?:\.\d+)*)-[^/]+\.ts$/;
const SECTION_MODULE_GLOB = "[0-9]*/**/*.ts";

const sourceRoot = new URL("../../src/", import.meta.url);
const modulePaths = globSync(SECTION_MODULE_GLOB, { cwd: fileURLToPath(sourceRoot) });

function sectionOf(path: string) {
    const match = SECTION_PATTERN.exec(`/${path}`);
    const section = match?.[1];
    if (section === undefined) {
        return "";
    }
    return section;
}

const schemas: { readonly name: string; readonly section: string; readonly schema: z.ZodType }[] = [];
for (const path of modulePaths) {
    const moduleUrl = new URL(path, sourceRoot);
    const exports: Record<string, unknown> = await import(moduleUrl.href);
    for (const [name, value] of Object.entries(exports)) {
        const isSchema = SCHEMA_NAME_PATTERN.test(name) && value instanceof z.ZodType;
        if (isSchema) {
            schemas.push({ name, section: sectionOf(path), schema: value });
        }
    }
}

describe("section module schemas", () => {
    test("are found", () => {
        expect(schemas.length).toBeGreaterThan(0);
    });

    test.each(schemas)("$name's description links section $section", ({ section, schema }) => {
        expect(schema.description).toContain(`${SPEC_LINK_PREFIX}${section}`);
    });
});
