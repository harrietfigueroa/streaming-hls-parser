// These tests pin section 4.4.2.3: EXT-X-DEFINE's attributes convert, and each
// definition resolves to one Variable Name and Value by NAME, IMPORT, or
// QUERYPARAM, with every rule the section states broken once in the negative
// space.
import { describe, expect, test } from "vitest";

import {
    DefinitionKind,
    extXDefineRules,
    extXDefineSchema,
    resolveDefinition,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";

const noVariables: ReadonlyMap<string, string> = new Map();
const PLAYLIST_URI = new URL("https://example.com/media.m3u8?token=a%20b&flag&empty=&quote=%22");

describe("extXDefineSchema", () => {
    const valid = [
        { attributes: { NAME: '"host"', VALUE: '"example.com"' }, define: { NAME: "host", VALUE: "example.com" } },
        { attributes: { NAME: '"blank"', VALUE: '""' }, define: { NAME: "blank", VALUE: "" } },
        { attributes: { IMPORT: '"Cdn_1"' }, define: { IMPORT: "Cdn_1" } },
        { attributes: { QUERYPARAM: '"token"' }, define: { QUERYPARAM: "token" } },
    ] as const;

    test.each(valid)("converts $attributes", ({ attributes, define }) => {
        const result = extXDefineSchema.safeParse(attributes);
        expect(result).toEqual({ success: true, data: define });
    });

    test.each([{ NAME: '"a b"', VALUE: '"x"' }, { NAME: "host", VALUE: '"x"' }, { IMPORT: '"a.b"' }])(
        "rejects %j",
        (attributes) => {
            const result = extXDefineSchema.safeParse(attributes);
            expect(result.success).toBe(false);
        },
    );
});

describe("resolveDefinition", () => {
    const defined = [
        { attributes: { NAME: '"host"', VALUE: '"example.com"' }, name: "host", value: "example.com" },
        { attributes: { QUERYPARAM: '"token"' }, name: "token", value: "a b" },
        { attributes: { QUERYPARAM: '"empty"' }, name: "empty", value: "" },
    ] as const;

    test.each(defined)("defines $name from $attributes", ({ attributes, name, value }) => {
        const definition = resolveDefinition({ attributes, variables: noVariables, uri: PLAYLIST_URI });
        expect(definition).toEqual({ kind: DefinitionKind.defined, name, value });
    });

    const malformed = [
        { name: "a NAME without VALUE", attributes: { NAME: '"host"' }, rule: extXDefineRules.valueWithName },
        { name: "no source", attributes: { VALUE: '"x"' }, rule: extXDefineRules.singleSource },
        { name: "two sources", attributes: { NAME: '"a"', VALUE: '"x"', IMPORT: '"b"' }, rule: extXDefineRules.singleSource },
        { name: "an invalid Variable Name", attributes: { NAME: '"a.b"', VALUE: '"x"' }, rule: extXDefineRules.format },
        { name: "an IMPORT with no Multivariant Playlist given", attributes: { IMPORT: '"host"' }, rule: extXDefineRules.importResolves },
        { name: "a QUERYPARAM the URI lacks", attributes: { QUERYPARAM: '"missing"' }, rule: extXDefineRules.queryParamResolves },
        { name: "a QUERYPARAM with no value", attributes: { QUERYPARAM: '"flag"' }, rule: extXDefineRules.queryParamResolves },
        { name: "a QUERYPARAM decoding to a quote", attributes: { QUERYPARAM: '"quote"' }, rule: extXDefineRules.queryParamCharacters },
    ] as const;

    test.each(malformed)("reports $name", ({ attributes, rule }) => {
        const definition = resolveDefinition({ attributes, variables: noVariables, uri: PLAYLIST_URI });
        expect(definition).toMatchObject({ kind: DefinitionKind.malformed, issue: { rule } });
    });

    test("reports a QUERYPARAM when the playlist has no URI", () => {
        const definition = resolveDefinition({ attributes: { QUERYPARAM: '"token"' }, variables: noVariables });
        expect(definition).toMatchObject({ kind: DefinitionKind.malformed, issue: { rule: extXDefineRules.queryParamResolves } });
    });

    test("reports a Variable Name an earlier definition declared", () => {
        const variables: ReadonlyMap<string, string> = new Map([["host", "a"]]);
        const definition = resolveDefinition({ attributes: { NAME: '"host"', VALUE: '"b"' }, variables });
        expect(definition).toMatchObject({ kind: DefinitionKind.malformed, issue: { rule: extXDefineRules.uniqueNames } });
    });

    test("treats Variable Names as case-sensitive", () => {
        const variables: ReadonlyMap<string, string> = new Map([["host", "a"]]);
        const definition = resolveDefinition({ attributes: { NAME: '"HOST"', VALUE: '"b"' }, variables });
        expect(definition).toEqual({ kind: DefinitionKind.defined, name: "HOST", value: "b" });
    });

    test("defines an IMPORT from the Multivariant Playlist's variables", () => {
        const imported: ReadonlyMap<string, string> = new Map([["host", "example.com"]]);
        const definition = resolveDefinition({ attributes: { IMPORT: '"host"' }, variables: noVariables, imported });
        expect(definition).toEqual({ kind: DefinitionKind.defined, name: "host", value: "example.com" });
    });

    test("reports an IMPORT the Multivariant Playlist does not declare", () => {
        const imported: ReadonlyMap<string, string> = new Map([["host", "example.com"]]);
        const definition = resolveDefinition({ attributes: { IMPORT: '"token"' }, variables: noVariables, imported });
        expect(definition).toMatchObject({ kind: DefinitionKind.malformed, issue: { rule: extXDefineRules.importResolves } });
    });

    test("leaves a definition 6.3.1 ignores undefined", () => {
        const attributes = { NAME: '"host"', VALUE: '"x"', "REQ-FUTURE": "1" };
        const definition = resolveDefinition({ attributes, variables: noVariables });
        expect(definition).toEqual({ kind: DefinitionKind.ignored });
    });
});
