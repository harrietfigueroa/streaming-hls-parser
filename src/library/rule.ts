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
