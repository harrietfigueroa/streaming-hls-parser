// Section 4.4.5.4, EXT-X-RENDITION-REPORT. This module is pure: it declares
// the tag's rules and attribute table, and checks that a report's URI is
// relative.
import { attributeListTagSchema, decimalIntegerSchema, quotedStringSchema } from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.5.4";

export const EXT_X_RENDITION_REPORT_TAG_NAME = "EXT-X-RENDITION-REPORT";

export const extXRenditionReportRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-RENDITION-REPORT's URI is a quoted-string, and its LAST-MSN and LAST-PART are decimal-integers.",
    },
    relativeUri: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "An EXT-X-RENDITION-REPORT's URI is relative to the URI of the Media Playlist containing it.",
    },
} as const satisfies Record<string, Rule>;

/**
 * Converts EXT-X-RENDITION-REPORT's attributes, each absent when not written: section 4.4.5.4 lets a
 * server omit any attribute, a required one included, whose value matches the containing playlist's.
 * Section 4.4.5.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.5.4
 */
export const extXRenditionReportSchema = attributeListTagSchema({
    URI: quotedStringSchema.optional(),
    "LAST-MSN": decimalIntegerSchema.optional(),
    "LAST-PART": decimalIntegerSchema.optional(),
})
    .describe("EXT-X-RENDITION-REPORT, section 4.4.5.4: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.5.4");

/** Checks that a report's URI, where it has one, is relative: a URI that parses with no base is absolute. */
export function checkRenditionReport(report: { readonly URI?: string | undefined }) {
    const issues: Issue[] = [];
    const uri = report.URI;
    if (uri === undefined) {
        return issues;
    }
    if (URL.canParse(uri)) {
        issues.push({ rule: extXRenditionReportRules.relativeUri, detail: `Rendition report URI ${uri} is absolute.` });
    }
    return issues;
}
