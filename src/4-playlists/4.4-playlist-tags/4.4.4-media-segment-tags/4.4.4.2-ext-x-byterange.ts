// Section 4.4.4.2, EXT-X-BYTERANGE. This module is pure: it declares the tag's
// rules and its schema, which converts <n>[@<o>] to a length and an offset,
// and checks that each offset-less range follows a range of its resource.
import { z } from "zod";

import { decimalIntegerSchema } from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.4.2";

export const EXT_X_BYTERANGE_TAG_NAME = "EXT-X-BYTERANGE";

export const extXByteRangeRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-BYTERANGE tag's value is a decimal-integer length, optionally followed by '@' and a decimal-integer offset.",
    },
    offsetFollowsSubRange: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A Media Segment whose byte range has no offset follows a Media Segment that is a sub-range of the same resource.",
    },
} as const satisfies Record<string, Rule>;

const OFFSET_SEPARATOR = "@";
const NOT_FOUND = -1;

const byteRangeFieldsSchema = z
    .object({ length: decimalIntegerSchema, offset: decimalIntegerSchema.optional() })
    .readonly();

type ByteRangeFields = z.input<typeof byteRangeFieldsSchema>;

function splitByteRange(value: string) {
    const separatorIndex = value.indexOf(OFFSET_SEPARATOR);
    if (separatorIndex === NOT_FOUND) {
        const lengthOnly: ByteRangeFields = { length: value };
        return lengthOnly;
    }
    const withOffset: ByteRangeFields = { length: value.slice(0, separatorIndex), offset: value.slice(separatorIndex + 1) };
    return withOffset;
}

/** Converts `<n>[@<o>]` to a frozen `{ length, offset }` in bytes, its offset absent when not written. */
export const byteRangeSchema = z.string().transform(splitByteRange).pipe(byteRangeFieldsSchema);

/** Converts the EXT-X-BYTERANGE tag's value per decision 25. */
export const extXByteRangeSchema = byteRangeSchema;

const offsetByteRangeFieldsSchema = z
    .object({ length: decimalIntegerSchema, offset: decimalIntegerSchema })
    .readonly();

type OffsetByteRangeFields = z.input<typeof offsetByteRangeFieldsSchema>;

// A range written without '@' has an empty offset, which the decimal-integer schema rejects.
function splitOffsetByteRange(value: string) {
    const separatorIndex = value.indexOf(OFFSET_SEPARATOR);
    if (separatorIndex === NOT_FOUND) {
        const offsetMissing: OffsetByteRangeFields = { length: value, offset: "" };
        return offsetMissing;
    }
    const fields: OffsetByteRangeFields = { length: value.slice(0, separatorIndex), offset: value.slice(separatorIndex + 1) };
    return fields;
}

/** Converts `<n>@<o>`, its offset required, to a frozen `{ length, offset }` in bytes. */
export const byteRangeWithOffsetSchema = z.string().transform(splitOffsetByteRange).pipe(offsetByteRangeFieldsSchema);

type ByteRange = z.output<typeof byteRangeSchema>;
type RangedSegment = { readonly uri: string; readonly [EXT_X_BYTERANGE_TAG_NAME]?: ByteRange | undefined };

/** Checks every byte range written without an offset against the segment before it. */
export function checkByteRangeOffsets(segments: readonly RangedSegment[]) {
    const issues: Issue[] = [];
    for (const [segmentIndex, segment] of segments.entries()) {
        const byteRange = segment[EXT_X_BYTERANGE_TAG_NAME];
        if (byteRange === undefined) {
            continue;
        }
        if (byteRange.offset !== undefined) {
            continue;
        }
        const previous = segments[segmentIndex - 1];
        const previousRange = previous?.[EXT_X_BYTERANGE_TAG_NAME];
        const isSameResource = previous?.uri === segment.uri;
        const followsSubRange = previousRange !== undefined && isSameResource;
        if (!followsSubRange) {
            const detail = `Segment ${segmentIndex + 1} has no offset and follows no sub-range of ${segment.uri}.`;
            issues.push({ rule: extXByteRangeRules.offsetFollowsSubRange, detail });
        }
    }
    return issues;
}
