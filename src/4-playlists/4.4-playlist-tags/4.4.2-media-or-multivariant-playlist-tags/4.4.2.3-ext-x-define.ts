// Section 4.4.2.3, EXT-X-DEFINE. This module is pure: it declares the tag's
// rules and attribute table, and resolves one definition to the Variable Name
// and Value it provides, from its NAME and VALUE, from the playlist's URI, or
// from the Multivariant Playlist's variables.
import { z } from "zod";

import {
    attributeListTagSchema,
    possiblyEmptyQuotedStringSchema,
    quotedStringSchema,
} from "../../4.2-attribute-lists.js";
import { unreachable } from "../../../library/assert.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.2.3";

export const EXT_X_DEFINE_TAG_NAME = "EXT-X-DEFINE";

export const extXDefineRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-DEFINE's NAME, IMPORT, and QUERYPARAM are quoted-strings of [a-z], [A-Z], [0-9], '-', and '_', and its VALUE is a quoted-string.",
    },
    singleSource: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-DEFINE tag contains exactly one of NAME, IMPORT, and QUERYPARAM.",
    },
    valueWithName: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-DEFINE tag with a NAME has a VALUE.",
    },
    uniqueNames: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "No two EXT-X-DEFINE tags in a playlist specify the same Variable Name.",
    },
    importResolves: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "An IMPORT names a variable declared in the Multivariant Playlist the Media Playlist was loaded from.",
    },
    importNotInMultivariant: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-DEFINE tags containing the IMPORT attribute occur only in Media Playlists.",
    },
    queryParamResolves: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A QUERYPARAM names a query parameter of the playlist's URI that has a value.",
    },
    queryParamCharacters: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A QUERYPARAM's percent-decoded value contains no character a quoted-string disallows.",
    },
} as const satisfies Record<string, Rule>;

/** A Variable Name's characters: [a-z], [A-Z], [0-9], '-', and '_'. */
export const VARIABLE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Unquotes a Variable Name and checks its characters.
 * Section 4.4.2.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.2.3
 */
const variableNameSchema = quotedStringSchema.pipe(z.string().regex(VARIABLE_NAME_PATTERN)).describe("EXT-X-DEFINE Variable Name, section 4.4.2.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.2.3");

/**
 * Converts EXT-X-DEFINE's attributes, each unquoted and absent when not written.
 * Section 4.4.2.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.2.3
 */
export const extXDefineSchema = attributeListTagSchema({
    NAME: variableNameSchema.optional(),
    VALUE: possiblyEmptyQuotedStringSchema.optional(),
    IMPORT: variableNameSchema.optional(),
    QUERYPARAM: variableNameSchema.optional(),
})
    .describe("EXT-X-DEFINE, section 4.4.2.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.2.3");

type Define = z.output<typeof extXDefineSchema>;

export const DefinitionKind = { defined: "defined", ignored: "ignored", malformed: "malformed" } as const;
export type DefinitionKind = (typeof DefinitionKind)[keyof typeof DefinitionKind];

type DefinitionPayloads = {
    [DefinitionKind.defined]: { readonly name: string; readonly value: string };
    [DefinitionKind.ignored]: Record<never, never>;
    [DefinitionKind.malformed]: { readonly issue: Issue };
};
type DefinitionMember<K extends DefinitionKind> = { readonly kind: K } & DefinitionPayloads[K];
export type Definition = { [K in DefinitionKind]: DefinitionMember<K> }[DefinitionKind];

const QueryLookupKind = { found: "found", valueless: "valueless", missing: "missing", undecodable: "undecodable" } as const;
type QueryLookupKind = (typeof QueryLookupKind)[keyof typeof QueryLookupKind];

type QueryLookupPayloads = {
    [QueryLookupKind.found]: { readonly value: string };
    [QueryLookupKind.valueless]: Record<never, never>;
    [QueryLookupKind.missing]: Record<never, never>;
    [QueryLookupKind.undecodable]: Record<never, never>;
};
type QueryLookupMember<K extends QueryLookupKind> = { readonly kind: K } & QueryLookupPayloads[K];
type QueryLookup = { [K in QueryLookupKind]: QueryLookupMember<K> }[QueryLookupKind];

const DecodeKind = { decoded: "decoded", undecodable: "undecodable" } as const;
type DecodeKind = (typeof DecodeKind)[keyof typeof DecodeKind];

type DecodePayloads = {
    [DecodeKind.decoded]: { readonly text: string };
    [DecodeKind.undecodable]: Record<never, never>;
};
type DecodeMember<K extends DecodeKind> = { readonly kind: K } & DecodePayloads[K];
type Decode = { [K in DecodeKind]: DecodeMember<K> }[DecodeKind];

const QUERY_PREFIX_LENGTH = "?".length;
const QUERY_PAIR_SEPARATOR = "&";
const QUERY_NAME_VALUE_SEPARATOR = "=";
// Section 4.2: a quoted-string cannot contain CR, LF, or '"'.
const QUOTED_STRING_DISALLOWED_PATTERN = /["\r\n]/;
const NOT_FOUND = -1;

function malformedDefinition(rule: Rule, detail: string) {
    const malformed: Definition = { kind: DefinitionKind.malformed, issue: { rule, detail } };
    return malformed;
}

function decodePercent(text: string) {
    try {
        const decoded: Decode = { kind: DecodeKind.decoded, text: decodeURIComponent(text) };
        return decoded;
    } catch (error) {
        if (error instanceof URIError) {
            const undecodable: Decode = { kind: DecodeKind.undecodable };
            return undecodable;
        }
        throw error;
    }
}

/** Finds the percent-decoded value of query parameter `name` in `uri`, preferring a match that has a value. */
function lookUpQueryParameter(uri: URL, name: string) {
    const query = uri.search.slice(QUERY_PREFIX_LENGTH);
    let lookup: QueryLookup = { kind: QueryLookupKind.missing };
    if (query.length === 0) {
        return lookup;
    }
    for (const pair of query.split(QUERY_PAIR_SEPARATOR)) {
        const separatorIndex = pair.indexOf(QUERY_NAME_VALUE_SEPARATOR);
        let rawName = pair;
        if (separatorIndex !== NOT_FOUND) {
            rawName = pair.slice(0, separatorIndex);
        }
        const decodedName = decodePercent(rawName);
        const isMatch = decodedName.kind === DecodeKind.decoded && decodedName.text === name;
        if (!isMatch) {
            continue;
        }
        if (separatorIndex === NOT_FOUND) {
            lookup = { kind: QueryLookupKind.valueless };
            continue;
        }
        const decodedValue = decodePercent(pair.slice(separatorIndex + 1));
        if (decodedValue.kind === DecodeKind.undecodable) {
            lookup = { kind: QueryLookupKind.undecodable };
            continue;
        }
        const found: QueryLookup = { kind: QueryLookupKind.found, value: decodedValue.text };
        return found;
    }
    return lookup;
}

function resolveQueryParameter(options: { readonly name: string; readonly uri: URL | undefined }) {
    const { name, uri } = options;
    if (uri === undefined) {
        return malformedDefinition(extXDefineRules.queryParamResolves, `QUERYPARAM ${name}: the playlist has no URI.`);
    }
    const lookup = lookUpQueryParameter(uri, name);
    switch (lookup.kind) {
        case QueryLookupKind.found: {
            if (QUOTED_STRING_DISALLOWED_PATTERN.test(lookup.value)) {
                const detail = `QUERYPARAM ${name} decodes to a '"', CR, or LF.`;
                return malformedDefinition(extXDefineRules.queryParamCharacters, detail);
            }
            const defined: Definition = { kind: DefinitionKind.defined, name, value: lookup.value };
            return defined;
        }
        case QueryLookupKind.valueless: {
            return malformedDefinition(extXDefineRules.queryParamResolves, `Query parameter ${name} has no value.`);
        }
        case QueryLookupKind.missing: {
            return malformedDefinition(extXDefineRules.queryParamResolves, `The URI has no query parameter ${name}.`);
        }
        case QueryLookupKind.undecodable: {
            return malformedDefinition(extXDefineRules.queryParamResolves, `Query parameter ${name} does not percent-decode.`);
        }
        default: {
            lookup satisfies never;
            return unreachable(lookup);
        }
    }
}

function countSources(define: Define) {
    let sourceCount = 0;
    for (const source of [define.NAME, define.IMPORT, define.QUERYPARAM]) {
        if (source !== undefined) {
            sourceCount += 1;
        }
    }
    return sourceCount;
}

function hasCustomIssue(issues: readonly z.core.$ZodIssue[]) {
    for (const issue of issues) {
        if (issue.code === "custom") {
            return true;
        }
    }
    return false;
}

/**
 * Resolves one EXT-X-DEFINE tag's raw attributes to the variable it provides, given the variables
 * earlier definitions provided, the playlist's URI, and the variables of the Multivariant Playlist it
 * was loaded from. A tag section 6.3.1 ignores whole provides no variable. Without those imported
 * variables, every IMPORT is malformed.
 */
export function resolveDefinition(options: {
    readonly attributes: Readonly<Record<string, string>>;
    readonly variables: ReadonlyMap<string, string>;
    readonly uri?: URL | undefined;
    readonly imported?: ReadonlyMap<string, string> | undefined;
}) {
    const { attributes, variables, uri, imported } = options;
    const result = extXDefineSchema.safeParse(attributes);
    if (!result.success) {
        if (hasCustomIssue(result.error.issues)) {
            const ignored: Definition = { kind: DefinitionKind.ignored };
            return ignored;
        }
        return malformedDefinition(extXDefineRules.format, z.prettifyError(result.error));
    }
    const define = result.data;
    const sourceCount = countSources(define);
    if (sourceCount !== 1) {
        return malformedDefinition(extXDefineRules.singleSource, `The tag has ${sourceCount} of NAME, IMPORT, and QUERYPARAM.`);
    }
    let name = "";
    if (define.NAME !== undefined) {
        name = define.NAME;
    } else if (define.IMPORT !== undefined) {
        name = define.IMPORT;
    } else if (define.QUERYPARAM !== undefined) {
        name = define.QUERYPARAM;
    }
    if (variables.has(name)) {
        return malformedDefinition(extXDefineRules.uniqueNames, `Variable ${name} is already defined.`);
    }
    if (define.NAME !== undefined) {
        if (define.VALUE === undefined) {
            return malformedDefinition(extXDefineRules.valueWithName, `NAME ${name} has no VALUE.`);
        }
        const defined: Definition = { kind: DefinitionKind.defined, name, value: define.VALUE };
        return defined;
    }
    if (define.IMPORT !== undefined) {
        if (imported === undefined) {
            return malformedDefinition(extXDefineRules.importResolves, `IMPORT ${name}: no Multivariant Playlist was given.`);
        }
        const value = imported.get(name);
        if (value === undefined) {
            return malformedDefinition(extXDefineRules.importResolves, `IMPORT ${name}: the Multivariant Playlist declares no such variable.`);
        }
        const importedDefinition: Definition = { kind: DefinitionKind.defined, name, value };
        return importedDefinition;
    }
    return resolveQueryParameter({ name, uri });
}

/** Reports each IMPORT among a Multivariant Playlist's definitions. */
export function checkMultivariantDefinitions(defines: readonly Define[]) {
    const issues: Issue[] = [];
    for (const define of defines) {
        if (define.IMPORT !== undefined) {
            issues.push({ rule: extXDefineRules.importNotInMultivariant, detail: `The Multivariant Playlist has IMPORT="${define.IMPORT}".` });
        }
    }
    return issues;
}
