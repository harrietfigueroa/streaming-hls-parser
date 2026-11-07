// The rule, context, and node types of oxlint's JavaScript plugins, read from
// the RuleTester signature, which is the plugin API's one exported entry point.
import type { RuleTester } from "oxlint/plugins-dev";

export type Rule = Parameters<RuleTester["run"]>[1];

type CreatingRule = Extract<Rule, { readonly create: unknown }>;

export type Context = Parameters<CreatingRule["create"]>[0];

type Visitor = ReturnType<CreatingRule["create"]>;

export type VariableDeclarator = Parameters<NonNullable<Visitor["VariableDeclarator"]>>[0];
