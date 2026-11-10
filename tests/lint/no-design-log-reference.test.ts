// These tests pin hls/no-design-log-reference: a comment, a string literal, or a
// template's text naming a design-log entry is reported, and code that names
// none, or uses the word only inside an identifier, is left alone.
import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import { noDesignLogReference } from "../../lint/rules/no-design-log-reference.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run("no-design-log-reference", noDesignLogReference, {
    valid: [
        { code: "// Section 4.2 defines the attribute-list grammar.\nconst a = 1;" },
        { code: 'const message = "The tag repeats.";' },
        { code: "const decisionCount = 1;" },
        { code: "const text = `Line ${1}: the tag repeats.`;" },
    ],
    invalid: [
        { code: "// Per decision 23, values are frozen.\nconst a = 1;", errors: [{ messageId: "named" }] },
        { code: "/** The limits of Decision 30. */\nconst a = 1;", errors: [{ messageId: "named" }] },
        { code: "/* See the decisions log. */\nconst a = 1;", errors: [{ messageId: "named" }] },
        { code: 'const requirement = "An offset, per decision 27.";', errors: [{ messageId: "named" }] },
        { code: "const detail = `Line ${1}: per decision 54.`;", errors: [{ messageId: "named" }] },
    ],
});
