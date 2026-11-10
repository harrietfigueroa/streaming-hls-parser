// The hls/no-design-log-reference rule. Code states its own rationale, or cites the spec
// section it follows; the design log under work/ is where entries are named,
// so a comment or a string naming one is reported wherever it appears.
import type { Rule } from "./rule.ts";

const REFERENCE_PATTERN = /\bdecisions?\b/i;

/** Reports each comment, string literal, and template text that names a design-log entry. */
export const noDesignLogReference = {
    meta: {
        type: "problem",
        docs: { description: "Code names no entry of the design log." },
        messages: {
            named: "This text names a design-log entry; state the rationale or cite the spec section instead.",
        },
        schema: [],
    },
    create(context) {
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    if (REFERENCE_PATTERN.test(comment.value)) {
                        context.report({ node: comment, messageId: "named" });
                    }
                }
            },
            Literal(node) {
                const isNamingString = typeof node.value === "string" && REFERENCE_PATTERN.test(node.value);
                if (isNamingString) {
                    context.report({ node, messageId: "named" });
                }
            },
            TemplateElement(node) {
                if (REFERENCE_PATTERN.test(node.value.raw)) {
                    context.report({ node, messageId: "named" });
                }
            },
        };
    },
} as const satisfies Rule;
