// The repository's own lint rules, which oxlint loads as a JavaScript plugin
// under the hls prefix.
import { noDesignLogReference } from "./rules/no-design-log-reference.ts";
import { schemaSpecLink } from "./rules/schema-spec-link.ts";

export default {
    meta: { name: "hls" },
    rules: {
        "no-design-log-reference": noDesignLogReference,
        "schema-spec-link": schemaSpecLink,
    },
};
