// Section 4.3, Variable Substitution, applied as section 6.3.1 specifies. This
// module is pure: it substitutes each Variable Reference in one element's text
// with its Variable Value, under a length limit on the result.
import { assertCondition } from "../library/assert.js";
import type { Issue } from "../library/rule.js";
import { utf8ByteLength } from "../library/utf8.js";
import { generalClientRules } from "../6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { VARIABLE_NAME_PATTERN } from "./4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";

export const SubstitutionKind = {
    substituted: "substituted",
    malformed: "malformed",
    limitExceeded: "limitExceeded",
} as const;
export type SubstitutionKind = (typeof SubstitutionKind)[keyof typeof SubstitutionKind];

type SubstitutionPayloads = {
    [SubstitutionKind.substituted]: { readonly value: string };
    [SubstitutionKind.malformed]: { readonly issue: Issue };
    [SubstitutionKind.limitExceeded]: { readonly bytesMax: number };
};
type SubstitutionMember<K extends SubstitutionKind> = { readonly kind: K } & SubstitutionPayloads[K];
export type Substitution = { [K in SubstitutionKind]: SubstitutionMember<K> }[SubstitutionKind];

const REFERENCE_OPEN = "{$";
const REFERENCE_CLOSE = "}";
const NOT_FOUND = -1;

/** Whether `text` contains a Variable Reference's opening "{$", the one way substitution can change it. */
export function mayContainVariableReference(text: string) {
    return text.includes(REFERENCE_OPEN);
}

function limitExceeded(bytesMax: number) {
    const exceeded: Substitution = { kind: SubstitutionKind.limitExceeded, bytesMax };
    return exceeded;
}

/**
 * Substitutes its Variable Value for every Variable Reference (`{$name}`) in `text` whose name is
 * in `variables`, keeping substituted values and all other text as written. Returns
 * `limitExceeded` once the result would pass `bytesMax` UTF-8 bytes.
 */
export function substituteVariables(options: {
    readonly text: string;
    readonly variables: ReadonlyMap<string, string>;
    readonly bytesMax: number;
}) {
    const { text, variables, bytesMax } = options;
    assertCondition(Number.isSafeInteger(bytesMax), `Byte limit ${bytesMax} is not an integer.`);
    assertCondition(bytesMax >= 0, `Byte limit ${bytesMax} is negative.`);
    const pieces: string[] = [];
    let byteCount = 0;
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
        const literalBytes = utf8ByteLength(literal);
        const valueBytes = utf8ByteLength(value);
        byteCount += literalBytes + valueBytes;
        if (byteCount > bytesMax) {
            return limitExceeded(bytesMax);
        }
        pieces.push(literal, value);
        copiedThrough = referenceEnd + REFERENCE_CLOSE.length;
        searchFrom = copiedThrough;
    }
    const tail = text.slice(copiedThrough);
    byteCount += utf8ByteLength(tail);
    if (byteCount > bytesMax) {
        return limitExceeded(bytesMax);
    }
    pieces.push(tail);
    const value = pieces.join("");
    const valueBytes = utf8ByteLength(value);
    assertCondition(valueBytes === byteCount, `Substituted bytes ${valueBytes} differ from the tracked ${byteCount}.`);
    const substituted: Substitution = { kind: SubstitutionKind.substituted, value };
    return substituted;
}
