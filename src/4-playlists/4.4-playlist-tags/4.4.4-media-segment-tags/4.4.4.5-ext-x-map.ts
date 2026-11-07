// Section 4.4.4.5, EXT-X-MAP. This module is pure: it declares the tag's
// rules and its attribute table as a schema.
import { attributeListTagSchema, quotedStringSchema } from "../../4.2-attribute-lists.js";
import { type Rule, Severity } from "../../../library/rule.js";
import { byteRangeWithOffsetSchema } from "./4.4.4.2-ext-x-byterange.js";

const SECTION = "4.4.4.5";

export const EXT_X_MAP_TAG_NAME = "EXT-X-MAP";

export const extXMapRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-MAP has a quoted-string URI and optionally a quoted-string BYTERANGE of the form <n>@<o>, its offset required.",
    },
} as const satisfies Record<string, Rule>;

/** Converts EXT-X-MAP's attributes: the Media Initialization Section's URI, and its byte range per decision 25. */
export const extXMapSchema = attributeListTagSchema({
    URI: quotedStringSchema,
    BYTERANGE: quotedStringSchema.pipe(byteRangeWithOffsetSchema).optional(),
});
