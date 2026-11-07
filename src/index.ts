// The default entry of decision 17: the HLS namespace over the tag schemas as
// their section modules declare them, run by zod's runtime parser.
import { createHLS } from "./library/create-hls.js";
import { defaultTagTables } from "./library/tag-table.js";

export const HLS = createHLS(defaultTagTables);

export {
    type MediaPlaylist,
    type MediaSegment,
    type MultivariantPlaylist,
    type Parse,
    ParseKind,
    type Playlist,
    PlaylistKind,
    type Variant,
} from "./library/create-hls.js";
export type { Issue, Rule, Severity } from "./library/rule.js";
export { Limit, type Limits, type ParseOptions } from "./library/options.js";
export { type DateTime, type TemporalNamespace, toDate, toEpochMilliseconds, toInstant } from "./library/date-time.js";
export { type IgnoredLine, IgnoredKind } from "./library/scan.js";
