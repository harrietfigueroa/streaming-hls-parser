// Section 4.3, Variable Substitution, applied as section 6.3.1 specifies. This
// module is pure: it substitutes each Variable Reference in one element's text
// with its Variable Value, under a length limit on the result.
import { assertCondition } from "../library/assert.js";
import type { Issue } from "../library/rule.js";
import { generalClientRules } from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";

export const SubstitutionKind = {
    substituted: "substituted",
    malformed: "malformed",
    limitExceeded: "limitExceeded",
} as const;
export type SubstitutionKind = (typeof SubstitutionKind)[keyof typeof SubstitutionKind];

type SubstitutionPayloads = {
    [SubstitutionKind.substituted]: { readonly value: string };
    [SubstitutionKind.malformed]: { readonly issue: Issue };
    [SubstitutionKind.limitExceeded]: { readonly lengthMax: number };
};
type SubstitutionMember<K extends SubstitutionKind> = { readonly kind: K } & SubstitutionPayloads[K];
export type Substitution = { [K in SubstitutionKind]: SubstitutionMember<K> }[SubstitutionKind];

const REFERENCE_OPEN = "{$";
const REFERENCE_CLOSE = "}";
// Section 4.4.2.3 restricts a Variable Name to [a-z], [A-Z], [0-9], '-', and '_'.
const VARIABLE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const NOT_FOUND = -1;

function limitExceeded(lengthMax: number) {
    const exceeded: Substitution = { kind: SubstitutionKind.limitExceeded, lengthMax };
    return exceeded;
}

/**
 * Substitutes its Variable Value for every Variable Reference (`{$name}`) in `text` whose name is
 * in `variables`, keeping substituted values and all other text as written. Returns
 * `limitExceeded` once the result would pass `lengthMax` UTF-16 code units.
 */
export function substituteVariables(options: {
    readonly text: string;
    readonly variables: ReadonlyMap<string, string>;
    readonly lengthMax: number;
}) {
    const { text, variables, lengthMax } = options;
    assertCondition(Number.isSafeInteger(lengthMax), `Length limit ${lengthMax} is not an integer.`);
    assertCondition(lengthMax >= 0, `Length limit ${lengthMax} is negative.`);
    const pieces: string[] = [];
    let length = 0;
    let copiedThrough = 0;
    // Each iteration moves searchFrom past at least the "{$" it found, so the loop is bounded by the text length.
    for (let searchFrom = 0; searchFrom < text.length; ) {
        const referenceStart = text.indexOf(REFERENCE_OPEN, searchFrom);
        if (referenceStart === NOT_FOUND) {
            break;
        }
        const nameStart = referenceStart + REFERENCE_OPEN.length;
        const referenceEnd = text.indexOf(REFERENCE_CLOSE, nameStart);
        if (referenceEnd === NOT_FOUND) {
            break;
        }
        const name = text.slice(nameStart, referenceEnd);
        if (!VARIABLE_NAME_PATTERN.test(name)) {
            searchFrom = nameStart;
            continue;
        }
        const value = variables.get(name);
        if (value === undefined) {
            const issue = { rule: generalClientRules.definedVariableReferences, detail: `Variable ${name} is not defined.` };
            const malformed: Substitution = { kind: SubstitutionKind.malformed, issue };
            return malformed;
        }
        const literal = text.slice(copiedThrough, referenceStart);
        length += literal.length + value.length;
        if (length > lengthMax) {
            return limitExceeded(lengthMax);
        }
        pieces.push(literal, value);
        copiedThrough = referenceEnd + REFERENCE_CLOSE.length;
        searchFrom = copiedThrough;
    }
    const tail = text.slice(copiedThrough);
    length += tail.length;
    if (length > lengthMax) {
        return limitExceeded(lengthMax);
    }
    pieces.push(tail);
    const value = pieces.join("");
    assertCondition(value.length === length, `Substituted length ${value.length} differs from the tracked ${length}.`);
    const substituted: Substitution = { kind: SubstitutionKind.substituted, value };
    return substituted;
}
