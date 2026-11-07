// Section 4.4.6.6, EXT-X-CONTENT-STEERING. This module is pure: it declares
// the tag's rules and attribute table, and checks its PATHWAY-ID against the
// Pathways the variants are on.
import { z } from "zod";

import { type AttributeWritersOf, attributeListTagSchema, quotedStringSchema, writeQuotedString } from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";
import type { StreamInf } from "./4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";

const SECTION = "4.4.6.6";

export const EXT_X_CONTENT_STEERING_TAG_NAME = "EXT-X-CONTENT-STEERING";

export const extXContentSteeringRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-CONTENT-STEERING has a quoted-string SERVER-URI and optionally a quoted-string PATHWAY-ID.",
    },
    singleTag: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXT-X-CONTENT-STEERING tag appears at most once in a Multivariant Playlist.",
    },
    pathwayOfVariant: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "EXT-X-CONTENT-STEERING's PATHWAY-ID is the PATHWAY-ID of one or more Variant Streams.",
    },
} as const satisfies Record<string, Rule>;

// Section 4.4.6.2 places a variant without PATHWAY-ID on this default Pathway.
const DEFAULT_PATHWAY_ID = ".";

/**
 * Converts EXT-X-CONTENT-STEERING's attributes, PATHWAY-ID absent when not written.
 * Section 4.4.6.6: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.6
 */
export const extXContentSteeringSchema = attributeListTagSchema({
    "SERVER-URI": quotedStringSchema,
    "PATHWAY-ID": quotedStringSchema.optional(),
}).describe("EXT-X-CONTENT-STEERING, section 4.4.6.6: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.6.6");

/** One converted EXT-X-CONTENT-STEERING tag. */
export type ContentSteering = Readonly<z.output<typeof extXContentSteeringSchema>>;

/** Checks that the tag's PATHWAY-ID, when written, is the Pathway of some variant. */
export function checkContentSteering(options: {
    readonly contentSteering: ContentSteering;
    readonly streamInfs: readonly StreamInf[];
}) {
    const issues: Issue[] = [];
    const pathwayId = options.contentSteering["PATHWAY-ID"];
    if (pathwayId === undefined) {
        return issues;
    }
    for (const streamInf of options.streamInfs) {
        let variantPathwayId = DEFAULT_PATHWAY_ID;
        if (streamInf["PATHWAY-ID"] !== undefined) {
            variantPathwayId = streamInf["PATHWAY-ID"];
        }
        if (variantPathwayId === pathwayId) {
            return issues;
        }
    }
    issues.push({ rule: extXContentSteeringRules.pathwayOfVariant, detail: `PATHWAY-ID="${pathwayId}" is the Pathway of no variant.` });
    return issues;
}

/** EXT-X-CONTENT-STEERING's attribute writers, in written order. */
export const extXContentSteeringAttributeWriters = {
    "SERVER-URI": writeQuotedString,
    "PATHWAY-ID": writeQuotedString,
} as const satisfies AttributeWritersOf<typeof extXContentSteeringSchema>;
