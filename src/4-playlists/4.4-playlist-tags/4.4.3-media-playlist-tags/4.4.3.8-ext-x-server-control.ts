// Section 4.4.3.8, EXT-X-SERVER-CONTROL. This module is pure: it declares the
// tag's rules and attribute table, and checks the bounds its attributes have
// against the Target Duration and the Part Target Duration.
import { z } from "zod";

import {
    attributeListTagSchema,
    decimalFloatingPointSchema,
    enumeratedStringSchema,
} from "../../4.2-attribute-lists.js";
import { type Issue, type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.3.8";

export const EXT_X_SERVER_CONTROL_TAG_NAME = "EXT-X-SERVER-CONTROL";

export const extXServerControlRules = {
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement:
            "EXT-X-SERVER-CONTROL's CAN-SKIP-UNTIL, HOLD-BACK, and PART-HOLD-BACK are decimal-floating-point, and its CAN-SKIP-DATERANGES and CAN-BLOCK-RELOAD are YES.",
    },
    skipBoundary: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The Skip Boundary, CAN-SKIP-UNTIL, is at least six times the Target Duration.",
    },
    skipDateRangesWithSkipUntil: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "CAN-SKIP-DATERANGES appears only with CAN-SKIP-UNTIL.",
    },
    holdBack: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "HOLD-BACK is at least three times the Target Duration.",
    },
    partHoldBack: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "PART-HOLD-BACK is at least twice the Part Target Duration.",
    },
    partHoldBackRequired: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "A playlist containing the EXT-X-PART-INF tag has an EXT-X-SERVER-CONTROL PART-HOLD-BACK.",
    },
} as const satisfies Record<string, Rule>;

const YES = "YES";

/**
 * Converts EXT-X-SERVER-CONTROL's attributes, each absent when not written.
 * Section 4.4.3.8: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.8
 */
export const extXServerControlSchema = attributeListTagSchema({
    "CAN-SKIP-UNTIL": decimalFloatingPointSchema.optional(),
    "CAN-SKIP-DATERANGES": enumeratedStringSchema([YES]).optional(),
    "HOLD-BACK": decimalFloatingPointSchema.optional(),
    "PART-HOLD-BACK": decimalFloatingPointSchema.optional(),
    "CAN-BLOCK-RELOAD": enumeratedStringSchema([YES]).optional(),
})
    .describe("EXT-X-SERVER-CONTROL, section 4.4.3.8: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-22#section-4.4.3.8");

type ServerControl = Readonly<Omit<z.output<typeof extXServerControlSchema>, "ignored">>;

const SKIP_BOUNDARY_TARGET_DURATION_MULTIPLE = 6;
const HOLD_BACK_TARGET_DURATION_MULTIPLE = 3;
const PART_HOLD_BACK_PART_TARGET_MULTIPLE = 2;

/** Checks EXT-X-SERVER-CONTROL's bounds, given the playlist's Target Duration and any EXT-X-PART-INF PART-TARGET. */
export function checkServerControl(options: {
    readonly serverControl?: ServerControl | undefined;
    readonly targetDuration: bigint;
    readonly partTarget?: number | undefined;
}) {
    const { serverControl, targetDuration, partTarget } = options;
    const issues: Issue[] = [];
    let partHoldBack: number | undefined;
    if (serverControl !== undefined) {
        const targetSeconds = Number(targetDuration);
        const skipUntil = serverControl["CAN-SKIP-UNTIL"];
        const holdBack = serverControl["HOLD-BACK"];
        partHoldBack = serverControl["PART-HOLD-BACK"];
        if (skipUntil !== undefined) {
            const skipBoundaryMin = targetSeconds * SKIP_BOUNDARY_TARGET_DURATION_MULTIPLE;
            if (skipUntil < skipBoundaryMin) {
                const detail = `CAN-SKIP-UNTIL ${skipUntil} s is under ${skipBoundaryMin} s.`;
                issues.push({ rule: extXServerControlRules.skipBoundary, detail });
            }
        } else if (serverControl["CAN-SKIP-DATERANGES"] !== undefined) {
            const detail = "CAN-SKIP-DATERANGES appears without CAN-SKIP-UNTIL.";
            issues.push({ rule: extXServerControlRules.skipDateRangesWithSkipUntil, detail });
        }
        if (holdBack !== undefined) {
            const holdBackMin = targetSeconds * HOLD_BACK_TARGET_DURATION_MULTIPLE;
            if (holdBack < holdBackMin) {
                issues.push({ rule: extXServerControlRules.holdBack, detail: `HOLD-BACK ${holdBack} s is under ${holdBackMin} s.` });
            }
        }
    }
    if (partTarget !== undefined) {
        if (partHoldBack === undefined) {
            const detail = "The playlist has EXT-X-PART-INF and no PART-HOLD-BACK.";
            issues.push({ rule: extXServerControlRules.partHoldBackRequired, detail });
        } else {
            const partHoldBackMin = partTarget * PART_HOLD_BACK_PART_TARGET_MULTIPLE;
            if (partHoldBack < partHoldBackMin) {
                const detail = `PART-HOLD-BACK ${partHoldBack} s is under ${partHoldBackMin} s.`;
                issues.push({ rule: extXServerControlRules.partHoldBack, detail });
            }
        }
    }
    return issues;
}
