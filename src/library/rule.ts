// A rule is one requirement of the spec, carrying its section citation and the
// severity a violation has under the default policy. Section modules declare
// their rules; nothing here knows which rules exist.

/** How a broken rule is reported: `malformed` fails the parse, `violation` is reported alongside the result. */
export const Severity = { malformed: "malformed", violation: "violation" } as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

/** One requirement of the spec. */
export type Rule = {
    /** The spec section stating the requirement, such as `"4.2"`. */
    readonly section: string;
    readonly severity: Severity;
    /** The requirement, paraphrased from the spec in one sentence. */
    readonly requirement: string;
};

/** One broken rule, with what was found. */
export type Issue = {
    readonly rule: Rule;
    readonly detail: string;
};

export const CheckKind = { passed: "passed", failed: "failed" } as const;
export type CheckKind = (typeof CheckKind)[keyof typeof CheckKind];

type CheckPayloads = {
    [CheckKind.passed]: Record<never, never>;
    [CheckKind.failed]: { readonly issue: Issue };
};
type CheckMember<K extends CheckKind> = { readonly kind: K } & CheckPayloads[K];
/** The outcome of checking one rule against parsed values. */
export type Check = { [K in CheckKind]: CheckMember<K> }[CheckKind];
