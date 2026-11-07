// Section 4.4.6.4, EXT-X-SESSION-DATA. This module is pure: it declares the
// tag's rules and attribute table, and checks each tag's VALUE or URI and the
// DATA-ID and LANGUAGE pairs across a playlist's tags.
import { z } from "zod";

import { type AttributeWritersOf, attributeListTagSchema, enumeratedStringSchema, quotedStringSchema, writeAsIs, writeQuotedString } from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.6.4";

export const EXT_X_SESSION_DATA_TAG_NAME = "EXT-X-SESSION-DATA";

export const extXSessionDataRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-SESSION-DATA has a quoted-string DATA-ID, and optionally a quoted-string VALUE, URI, and LANGUAGE and an enumerated-string FORMAT.",
    },
    valueOrUri: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "Each EXT-X-SESSION-DATA tag contains either a VALUE or a URI attribute, but not both.",
    },
    distinctDataIdLanguage: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "No two EXT-X-SESSION-DATA tags have the same DATA-ID and the same LANGUAGE.",
    },
} as const satisfies Record<string, Rule>;

export const SessionDataFormat = { json: "JSON", raw: "RAW" } as const;
export type SessionDataFormat = (typeof SessionDataFormat)[keyof typeof SessionDataFormat];

/**
 * Converts EXT-X-SESSION-DATA's attributes, each optional one absent when not written.
 * Section 4.4.6.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.4
 */
export const extXSessionDataSchema = attributeListTagSchema({
    "DATA-ID": quotedStringSchema,
    VALUE: quotedStringSchema.optional(),
    URI: quotedStringSchema.optional(),
    FORMAT: enumeratedStringSchema([SessionDataFormat.json, SessionDataFormat.raw]).optional(),
    LANGUAGE: quotedStringSchema.optional(),
}).describe("EXT-X-SESSION-DATA, section 4.4.6.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.4");

/** One converted EXT-X-SESSION-DATA tag. */
export type SessionData = Readonly<z.output<typeof extXSessionDataSchema>>;

/** Checks each tag's VALUE or URI, and that no two tags share a DATA-ID and LANGUAGE, an absent LANGUAGE included. */
export function checkSessionData(sessionData: readonly SessionData[]) {
    const issues: Issue[] = [];
    const pairs = new Set<string>();
    for (const [index, tag] of sessionData.entries()) {
        const where = `Session data ${index + 1}`;
        const hasValue = tag.VALUE !== undefined;
        const hasUri = tag.URI !== undefined;
        if (hasValue === hasUri) {
            issues.push({ rule: extXSessionDataRules.valueOrUri, detail: `${where}: DATA-ID="${tag["DATA-ID"]}" has both VALUE and URI or neither.` });
        }
        // JSON keeps an absent LANGUAGE (null) apart from every written one.
        const pair = JSON.stringify([tag["DATA-ID"], tag.LANGUAGE]);
        if (pairs.has(pair)) {
            issues.push({ rule: extXSessionDataRules.distinctDataIdLanguage, detail: `${where}: DATA-ID="${tag["DATA-ID"]}" repeats with its LANGUAGE.` });
        }
        pairs.add(pair);
    }
    return issues;
}

/** EXT-X-SESSION-DATA's attribute writers, in written order. */
export const extXSessionDataAttributeWriters = {
    "DATA-ID": writeQuotedString,
    VALUE: writeQuotedString,
    URI: writeQuotedString,
    FORMAT: writeAsIs,
    LANGUAGE: writeQuotedString,
} as const satisfies AttributeWritersOf<typeof extXSessionDataSchema>;
