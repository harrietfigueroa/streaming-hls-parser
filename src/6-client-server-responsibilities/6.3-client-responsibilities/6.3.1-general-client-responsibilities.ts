// Section 6.3.1, General Client Responsibilities. This module declares the
// section's parsing rules; the modules that apply each rule import it from here.
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
