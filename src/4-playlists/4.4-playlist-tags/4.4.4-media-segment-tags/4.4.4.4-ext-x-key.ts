// Section 4.4.4.4, EXT-X-KEY. This module is pure: it declares the tag's
// rules and attribute table, and checks the attributes each METHOD requires
// or forbids.
import { z } from "zod";

import {
    type AttributeWritersOf,
    attributeListTagSchema,
    enumeratedStringSchema,
    hexadecimalSequenceSchema,
    quotedStringSchema,
    writeAsIs,
    writeQuotedString,
} from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.4";

export const EXT_X_KEY_TAG_NAME = "EXT-X-KEY";

export const extXKeyRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-KEY has an enumerated-string METHOD, and optionally a quoted-string URI, a 128-bit hexadecimal-sequence IV, a quoted-string KEYFORMAT, and a quoted-string KEYFORMATVERSIONS of '/'-separated positive integers.",
    },
    noneAlone: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-KEY whose METHOD is NONE has no other attributes.",
    },
    uriRequired: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-KEY whose METHOD is not NONE has a URI.",
    },
    ivForbidden: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-KEY whose METHOD is AES-256-GCM or SAMPLE-AES-CTR has no IV.",
    },
} as const satisfies Record<string, Rule>;

export const KeyMethod = {
    none: "NONE",
    aes128: "AES-128",
    sampleAes: "SAMPLE-AES",
    sampleAesCtr: "SAMPLE-AES-CTR",
    aes256Gcm: "AES-256-GCM",
} as const;
export type KeyMethod = (typeof KeyMethod)[keyof typeof KeyMethod];

const keyMethods = [KeyMethod.none, KeyMethod.aes128, KeyMethod.sampleAes, KeyMethod.sampleAesCtr, KeyMethod.aes256Gcm] as const;

// A 128-bit IV is at most 32 hexadecimal digits, 4 bits each, after its "0x".
const IV_DIGIT_COUNT_MAX = 32;
const IV_LENGTH_MAX = "0x".length + IV_DIGIT_COUNT_MAX;
const KEYFORMAT_VERSIONS_PATTERN = /^[1-9][0-9]*(?:\/[1-9][0-9]*)*$/;

/** EXT-X-KEY's attributes, which EXT-X-SESSION-KEY shares (section 4.4.6.5). */
export const keyAttributes = {
    METHOD: enumeratedStringSchema(keyMethods),
    URI: quotedStringSchema.optional(),
    IV: hexadecimalSequenceSchema.max(IV_LENGTH_MAX).optional(),
    KEYFORMAT: quotedStringSchema.optional(),
    KEYFORMATVERSIONS: quotedStringSchema.pipe(z.string().regex(KEYFORMAT_VERSIONS_PATTERN)).optional(),
} as const;

/**
 * Converts EXT-X-KEY's attributes, each optional one absent when not written.
 * Section 4.4.4.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.4
 */
export const extXKeySchema = attributeListTagSchema(keyAttributes).describe("EXT-X-KEY, section 4.4.4.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.4.4");

/** One converted EXT-X-KEY or EXT-X-SESSION-KEY, without its unrecognized attributes. */
export type Key = Readonly<Omit<z.output<typeof extXKeySchema>, "ignored">>;

const IV_FORBIDDEN_METHODS: ReadonlySet<KeyMethod> = new Set([KeyMethod.aes256Gcm, KeyMethod.sampleAesCtr]);

/** Checks the attributes one key's METHOD requires or forbids. */
export function checkKey(key: Key) {
    const issues: Issue[] = [];
    if (key.METHOD === KeyMethod.none) {
        const others = [key.URI, key.IV, key.KEYFORMAT, key.KEYFORMATVERSIONS];
        if (others.some(isPresent)) {
            issues.push({ rule: extXKeyRules.noneAlone, detail: "METHOD=NONE has other attributes." });
        }
        return issues;
    }
    if (key.URI === undefined) {
        issues.push({ rule: extXKeyRules.uriRequired, detail: `METHOD=${key.METHOD} has no URI.` });
    }
    const isIvForbidden = IV_FORBIDDEN_METHODS.has(key.METHOD);
    const hasForbiddenIv = isIvForbidden && key.IV !== undefined;
    if (hasForbiddenIv) {
        issues.push({ rule: extXKeyRules.ivForbidden, detail: `METHOD=${key.METHOD} has an IV.` });
    }
    return issues;
}

function isPresent(attribute: string | undefined) {
    return attribute !== undefined;
}

// An EXT-X-KEY without KEYFORMAT has the implicit KEYFORMAT "identity".
const IMPLICIT_KEYFORMAT = "identity";

function keyFormatOf(key: Key) {
    if (key.KEYFORMAT === undefined) {
        return IMPLICIT_KEYFORMAT;
    }
    return key.KEYFORMAT;
}

/**
 * The keys applying to a Media Segment, given those applying before its own EXT-X-KEY tags and those
 * tags in line order: each key ends the applying key of its KEYFORMAT, and a METHOD of NONE ends every
 * key, so the segments after it are unencrypted.
 */
export function applyKeys<K extends Key>(options: { readonly applying: readonly K[]; readonly written: readonly K[] }) {
    let applying = options.applying;
    for (const key of options.written) {
        if (key.METHOD === KeyMethod.none) {
            applying = [];
            continue;
        }
        const keyFormat = keyFormatOf(key);
        const kept: K[] = [];
        for (const other of applying) {
            if (keyFormatOf(other) !== keyFormat) {
                kept.push(other);
            }
        }
        kept.push(key);
        applying = kept;
    }
    return Object.freeze(applying);
}

/** EXT-X-KEY's attribute writers, in written order, which EXT-X-SESSION-KEY shares. */
export const keyAttributeWriters = {
    METHOD: writeAsIs,
    URI: writeQuotedString,
    IV: writeAsIs,
    KEYFORMAT: writeQuotedString,
    KEYFORMATVERSIONS: writeQuotedString,
} as const satisfies AttributeWritersOf<typeof extXKeySchema>;
