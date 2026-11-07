// The default entry: the HLS namespace over the tag schemas as
// their section modules declare them, run by zod's runtime parser.
import { createHLS } from "./library/create-hls.js";
import { defaultTagTables } from "./library/tag-table.js";

export const HLS = createHLS(defaultTagTables);

export * from "./library/public-surface.js";
