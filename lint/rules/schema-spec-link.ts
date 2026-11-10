// The hls/schema-spec-link rule. A spec section module's schemas each link the section
// of the pinned draft defining them twice: in the doc comment a reader of the
// source sees, and in the .describe() description a consumer of the schema
// reads at runtime from its .description field. The two links match.
import type { Context, Rule, VariableDeclarator } from "./rule.ts";

const SPEC_LINK_PATTERN = /https:\/\/datatracker\.ietf\.org\/doc\/html\/draft-pantos-hls-rfc8216bis-22#section-\d+(?:\.\d+)*/;
const SCHEMA_NAME_PATTERN = /Schema$/;
const DOC_COMMENT_PREFIX = "*";
const DESCRIBE_METHOD = "describe";
// Array.prototype.at counts a negative index from the end.
const LAST_INDEX_FROM_END = -1;

type Expression = NonNullable<VariableDeclarator["init"]>;
type Comment = ReturnType<Context["sourceCode"]["getCommentsBefore"]>[number];

const LinkKind = { linked: "linked", unlinked: "unlinked" } as const;
type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

type LinkPayloads = {
    [LinkKind.linked]: { readonly link: string };
    [LinkKind.unlinked]: Record<never, never>;
};
type LinkMember<K extends LinkKind> = { readonly kind: K } & LinkPayloads[K];
type Link = { [K in LinkKind]: LinkMember<K> }[LinkKind];

const DescriptionKind = { described: "described", undescribed: "undescribed" } as const;
type DescriptionKind = (typeof DescriptionKind)[keyof typeof DescriptionKind];

type DescriptionPayloads = {
    [DescriptionKind.described]: { readonly text: string };
    [DescriptionKind.undescribed]: Record<never, never>;
};
type DescriptionMember<K extends DescriptionKind> = { readonly kind: K } & DescriptionPayloads[K];
type Description = { [K in DescriptionKind]: DescriptionMember<K> }[DescriptionKind];

function linkIn(text: string) {
    const match = SPEC_LINK_PATTERN.exec(text);
    if (match === null) {
        const unlinked: Link = { kind: LinkKind.unlinked };
        return unlinked;
    }
    const linked: Link = { kind: LinkKind.linked, link: match[0] };
    return linked;
}

/** Whether a declarator sits at module level, directly or under an export. */
function isModuleLevel(declarator: VariableDeclarator) {
    const container = declarator.parent.parent;
    if (container === null) {
        return false;
    }
    if (container.type === "Program") {
        return true;
    }
    if (container.type === "ExportNamedDeclaration") {
        return container.parent.type === "Program";
    }
    return false;
}

/** The statement a module-level declarator's doc comment precedes: its export, when it has one. */
function statementOf(declarator: VariableDeclarator) {
    const declaration = declarator.parent;
    const container = declaration.parent;
    const isExported = container !== null && container.type === "ExportNamedDeclaration";
    if (isExported) {
        return container;
    }
    return declaration;
}

/** The link in the doc comment directly before a statement, the last of the comments there. */
function commentLinkIn(comments: readonly Comment[]) {
    const docComment = comments.at(LAST_INDEX_FROM_END);
    if (docComment === undefined) {
        const unlinked: Link = { kind: LinkKind.unlinked };
        return unlinked;
    }
    const isBlock = docComment.type === "Block";
    const isDocComment = isBlock && docComment.value.startsWith(DOC_COMMENT_PREFIX);
    if (!isDocComment) {
        const unlinked: Link = { kind: LinkKind.unlinked };
        return unlinked;
    }
    return linkIn(docComment.value);
}

/** The text of a template with no substitutions, its quasis joined. */
function templateText(quasis: readonly { readonly value: { readonly raw: string } }[]) {
    let text = "";
    for (const quasi of quasis) {
        text += quasi.value.raw;
    }
    return text;
}

/** The literal description an expression's outermost `.describe()` call gives. */
function descriptionOf(init: Expression) {
    const undescribed: Description = { kind: DescriptionKind.undescribed };
    if (init.type !== "CallExpression") {
        return undescribed;
    }
    const callee = init.callee;
    if (callee.type !== "MemberExpression") {
        return undescribed;
    }
    const property = callee.property;
    const isDescribeCall = property.type === "Identifier" && property.name === DESCRIBE_METHOD;
    if (!isDescribeCall) {
        return undescribed;
    }
    const [argument] = init.arguments;
    const isStringLiteral = argument?.type === "Literal" && typeof argument.value === "string";
    if (isStringLiteral) {
        const described: Description = { kind: DescriptionKind.described, text: argument.value };
        return described;
    }
    const isTemplate = argument?.type === "TemplateLiteral";
    if (isTemplate) {
        const isPlainTemplate = argument.expressions.length === 0;
        if (isPlainTemplate) {
            const described: Description = { kind: DescriptionKind.described, text: templateText(argument.quasis) };
            return described;
        }
    }
    return undescribed;
}

/** Reports a module-level schema binding whose doc comment or description lacks its spec section's link. */
export const schemaSpecLink = {
    meta: {
        type: "problem",
        docs: { description: "Each module-level schema links its spec section in its doc comment and its description." },
        messages: {
            missingCommentLink: "{{name}}'s doc comment links no section of the pinned draft.",
            missingDescription: "{{name}} ends in no .describe() call with a literal description.",
            missingDescriptionLink: "{{name}}'s description links no section of the pinned draft.",
            mismatchedLinks: "{{name}}'s doc comment links {{commentLink}}, and its description {{descriptionLink}}.",
        },
        schema: [],
    },
    create(context) {
        return {
            VariableDeclarator(node) {
                if (node.id.type !== "Identifier") {
                    return;
                }
                const name = node.id.name;
                const isModuleSchema = SCHEMA_NAME_PATTERN.test(name) && isModuleLevel(node);
                if (!isModuleSchema) {
                    return;
                }
                const comments = context.sourceCode.getCommentsBefore(statementOf(node));
                const commentLink = commentLinkIn(comments);
                if (commentLink.kind === LinkKind.unlinked) {
                    context.report({ node, messageId: "missingCommentLink", data: { name } });
                }
                if (node.init === null) {
                    context.report({ node, messageId: "missingDescription", data: { name } });
                    return;
                }
                const description = descriptionOf(node.init);
                if (description.kind === DescriptionKind.undescribed) {
                    context.report({ node, messageId: "missingDescription", data: { name } });
                    return;
                }
                const descriptionLink = linkIn(description.text);
                if (descriptionLink.kind === LinkKind.unlinked) {
                    context.report({ node, messageId: "missingDescriptionLink", data: { name } });
                    return;
                }
                const isMismatched = commentLink.kind === LinkKind.linked && commentLink.link !== descriptionLink.link;
                if (isMismatched) {
                    const data = { name, commentLink: commentLink.link, descriptionLink: descriptionLink.link };
                    context.report({ node, messageId: "mismatchedLinks", data });
                }
            },
        };
    },
} as const satisfies Rule;
