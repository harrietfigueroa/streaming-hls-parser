// Section 4.4.6.5, EXT-X-SESSION-KEY. This module is pure: it declares the
// tag's rules and its attribute table, EXT-X-KEY's, and checks a playlist's
// session keys.
import { attributeListTagSchema } from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";
import { checkKey, type Key, keyAttributes, KeyMethod } from "../4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";

const SECTION = "4.4.6.5";

export const EXT_X_SESSION_KEY_TAG_NAME = "EXT-X-SESSION-KEY";

export const extXSessionKeyRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-SESSION-KEY's attributes have EXT-X-KEY's types, with an enumerated-string METHOD.",
    },
    methodNotNone: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-SESSION-KEY's METHOD is not NONE.",
    },
    distinctKeys: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "No two EXT-X-SESSION-KEY tags have the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts EXT-X-SESSION-KEY's attributes, each optional one absent when not written.
 * Section 4.4.6.5: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.5
 */
export const extXSessionKeySchema = attributeListTagSchema(keyAttributes).describe("EXT-X-SESSION-KEY, section 4.4.6.5: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.5");

/** Checks each session key's METHOD and EXT-X-KEY's rules for it, and that no two session keys are alike. */
export function checkSessionKeys(keys: readonly Key[]) {
    const issues: Issue[] = [];
    const written = new Set<string>();
    for (const [index, key] of keys.entries()) {
        const where = `Session key ${index + 1}`;
        if (key.METHOD === KeyMethod.none) {
            issues.push({ rule: extXSessionKeyRules.methodNotNone, detail: `${where} has METHOD=NONE.` });
        } else {
            const keyIssues = checkKey(key);
            for (const issue of keyIssues) {
                issues.push({ rule: issue.rule, detail: `${where}: ${issue.detail}` });
            }
        }
        // JSON keeps an absent attribute (null) apart from every written one.
        const attributes = JSON.stringify([key.METHOD, key.URI, key.IV, key.KEYFORMAT, key.KEYFORMATVERSIONS]);
        if (written.has(attributes)) {
            issues.push({ rule: extXSessionKeyRules.distinctKeys, detail: `${where} repeats an earlier session key.` });
        }
        written.add(attributes);
    }
    return issues;
}
