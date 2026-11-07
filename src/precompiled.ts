// The precompiled entry: the HLS namespace over tag schemas compiled by zod's
// ahead-of-time compiler. Compilation generates code with `new Function`, so
// this entry needs an environment that permits eval, and the default entry is
// the one that runs everywhere. Compiling clones each schema and leaves the
// host's zod configuration untouched.
import { z } from "zod";

import { createHLS } from "./library/create-hls.js";
import { createTagTables } from "./library/tag-table.js";

// A schema the compiler cannot model keeps the runtime parser rather than throwing at import.
function compileSchema<Schema extends z.ZodType>(schema: Schema) {
    return z.compile(schema, { strict: false });
}

const compiledTagTables = createTagTables(compileSchema);

export const HLS = createHLS(compiledTagTables);

export * from "./library/public-surface.js";
