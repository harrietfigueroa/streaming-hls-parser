// Section 4.4.6.3, EXT-X-I-FRAME-STREAM-INF. This module is pure: it declares
// the tag's rules and its attribute table, EXT-X-STREAM-INF's but FRAME-RATE,
// AUDIO, SUBTITLES, and CLOSED-CAPTIONS, with a URI.
import { attributeListTagSchema, quotedStringSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";
import { variantStreamAttributes } from "./4.4.6.2-ext-x-stream-inf.js";

const SECTION = "4.4.6.3";

export const EXT_X_I_FRAME_STREAM_INF_TAG_NAME = "EXT-X-I-FRAME-STREAM-INF";

export const extXIFrameStreamInfRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-I-FRAME-STREAM-INF's attributes have EXT-X-STREAM-INF's types, with a decimal-integer BANDWIDTH and a quoted-string URI.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts EXT-X-I-FRAME-STREAM-INF's attributes, each optional one absent when not written.
 * Section 4.4.6.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.3
 */
export const extXIFrameStreamInfSchema = attributeListTagSchema({ ...variantStreamAttributes, URI: quotedStringSchema }).describe("EXT-X-I-FRAME-STREAM-INF, section 4.4.6.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.3");
