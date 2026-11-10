// These tests pin hls/schema-spec-link: a module-level schema binding carries
// a doc comment and a .describe() description that link the same section of
// the pinned draft, and every way of falling short of that is reported.
import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import { schemaSpecLink } from "../../lint/rules/schema-spec-link.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

const LINK = "https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.1";
const OTHER_LINK = "https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.2";

tester.run("schema-spec-link", schemaSpecLink, {
    valid: [
        { code: `/** The Target Duration, per ${LINK}. */\nexport const targetSchema = z.bigint().describe("The Target Duration: ${LINK}");` },
        { code: `/** The Target Duration, per ${LINK}. */\nconst targetSchema = z.bigint().describe(\`The Target Duration: ${LINK}\`);` },
        { code: 'const target = z.bigint();' },
        { code: "function build() {\n    const innerSchema = z.bigint();\n    return innerSchema;\n}" },
    ],
    invalid: [
        { code: `export const targetSchema = z.bigint().describe("${LINK}");`, errors: [{ messageId: "missingCommentLink" }] },
        { code: `/** The Target Duration. */\nexport const targetSchema = z.bigint().describe("${LINK}");`, errors: [{ messageId: "missingCommentLink" }] },
        { code: `/** The Target Duration, per ${LINK}. */\nexport const targetSchema = z.bigint();`, errors: [{ messageId: "missingDescription" }] },
        { code: `/** The Target Duration, per ${LINK}. */\nexport const targetSchema = z.bigint().describe("The Target Duration.");`, errors: [{ messageId: "missingDescriptionLink" }] },
        { code: `/** The Target Duration, per ${LINK}. */\nexport const targetSchema = z.bigint().describe("${LINK}").optional();`, errors: [{ messageId: "missingDescription" }] },
        { code: `/** The Target Duration, per ${LINK}. */\nexport const targetSchema = z.bigint().describe("${OTHER_LINK}");`, errors: [{ messageId: "mismatchedLinks" }] },
    ],
});
