// Section 6.3.1, General Client Responsibilities. This module declares the
// section's parsing rules, and the reasons it gives for ignoring a whole tag.
import { type Rule, Severity } from "../../library/rule.js";

const SECTION = "6.3.1";

export const generalClientRules = {
    definedVariableReferences: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "A Variable Reference whose Variable Name no preceding EXT-X-DEFINE tag provides triggers a parsing error.",
    },
} as const satisfies Record<string, Rule>;

/** Why a whole tag is ignored, citing the section 6.3.1 rule that ignores it. */
export type IgnoreReason = { readonly section: string; readonly requirement: string };

export const ignoreReasons = {
    unrecognizedRequiredAttribute: {
        section: SECTION,
        requirement: 'A tag containing an attribute with an unrecognized AttributeName starting with "REQ-" is ignored.',
    },
    unrecognizedEnumeratedValue: {
        section: SECTION,
        requirement:
            "A tag containing an enumerated-string attribute whose AttributeName is recognized and whose AttributeValue is not is ignored.",
    },
} as const satisfies Record<string, IgnoreReason>;
