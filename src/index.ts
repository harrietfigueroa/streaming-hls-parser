// The default entry of decision 17: the HLS namespace over the tag schemas as
// their section modules declare them, run by zod's runtime parser.
import { createHLS } from "./library/create-hls.js";
import { defaultTagTables } from "./library/tag-table.js";

export const HLS = createHLS(defaultTagTables);

export { type MediaPlaylist, type MediaSegment, type Parse, ParseKind, PlaylistKind } from "./library/create-hls.js";
export type { Issue, Rule, Severity } from "./library/rule.js";
export { Limit, type Limits, type ParseOptions } from "./library/options.js";
export { type IgnoredLine, IgnoredKind } from "./library/scan.js";
