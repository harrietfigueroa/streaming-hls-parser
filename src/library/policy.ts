// The severity policy of decision 8: one lookup from a rule to the severity a
// broken rule has. A stricter or more lenient policy is another function of
// the same type, with no change to the checks that report issues.
import type { Rule, Severity } from "./rule.js";

/** Resolves the severity a broken `rule` has. */
export type Policy = (rule: Rule) => Severity;

/** The default policy: every rule keeps the severity it declares. */
export function defaultPolicy(rule: Rule) {
    return rule.severity;
}
