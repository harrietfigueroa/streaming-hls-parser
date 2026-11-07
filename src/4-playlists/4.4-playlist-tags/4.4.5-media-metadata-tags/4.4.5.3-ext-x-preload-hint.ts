// Section 4.4.5.3, EXT-X-PRELOAD-HINT. This module is pure: it declares the
// tag's rules and its attribute table as a schema.
import {
    attributeListTagSchema,
    decimalIntegerSchema,
    enumeratedStringSchema,
    quotedStringSchema,
} from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.5.3";

export const EXT_X_PRELOAD_HINT_TAG_NAME = "EXT-X-PRELOAD-HINT";

export const extXPreloadHintRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-PRELOAD-HINT has a TYPE of PART or MAP and a quoted-string URI, and optionally decimal-integer BYTERANGE-START and BYTERANGE-LENGTH.",
    },
    notWithEndList: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist containing an EXT-X-ENDLIST tag contains no EXT-X-PRELOAD-HINT tag.",
    },
} as const satisfies Record<string, Rule>;

export const PreloadHintType = { part: "PART", map: "MAP" } as const;
export type PreloadHintType = (typeof PreloadHintType)[keyof typeof PreloadHintType];

/**
 * Converts EXT-X-PRELOAD-HINT's attributes, each optional one absent when not written.
 * Section 4.4.5.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.5.3
 */
export const extXPreloadHintSchema = attributeListTagSchema({
    TYPE: enumeratedStringSchema([PreloadHintType.part, PreloadHintType.map]),
    URI: quotedStringSchema,
    "BYTERANGE-START": decimalIntegerSchema.optional(),
    "BYTERANGE-LENGTH": decimalIntegerSchema.optional(),
})
    .describe("EXT-X-PRELOAD-HINT, section 4.4.5.3: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.5.3");
