// Section 4.4.1.1, EXTM3U. This module is pure: it declares the tag's schema,
// which converts the tag's absent value to true, and checks that a playlist's
// first line is the tag.
import { z } from "zod";

import { type Line, type LineCheck, LineCheckKind, LineKind } from "../../4.1-definition-of-a-playlist.js";
import { type Rule, Severity } from "../../../library/rule.js";

const SECTION = "4.4.1.1";

export const EXTM3U_TAG_NAME = "EXTM3U";

export const extm3uRules = {
    identification: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXTM3U tag is the first line of every Media Playlist and every Multivariant Playlist.",
    },
    format: {
        section: SECTION,
        severity: Severity.malformed,
        requirement: "The EXTM3U tag has no value.",
    },
} as const satisfies Record<string, Rule>;

function toPresent() {
    return true as const;
}

/** Converts the EXTM3U tag's value, which is absent, to true per decision 23. */
export const extm3uSchema = z.undefined().transform(toPresent);

/** Checks that a playlist's classified first line is the EXTM3U tag; the tag's value is the schema's to check. */
export function checkIdentification(firstLine: Line) {
    const isTag = firstLine.kind === LineKind.tag;
    const isExtm3u = isTag && firstLine.name === EXTM3U_TAG_NAME;
    if (isExtm3u) {
        const valid: LineCheck = { kind: LineCheckKind.valid };
        return valid;
    }
    const issue = { rule: extm3uRules.identification, detail: `The first line is a ${firstLine.kind}, not EXTM3U.` };
    const malformed: LineCheck = { kind: LineCheckKind.malformed, issue };
    return malformed;
}
