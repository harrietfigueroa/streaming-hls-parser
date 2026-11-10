// These tests pin section 4.4.1.1: the EXTM3U tag's raw value, true for a tag
// written without a value, converts to true, and a playlist is identified only
// when EXTM3U is its first line.
// Invalid cases each break exactly one of the section's rules.
import { describe, expect, test } from "vitest";

import { classifyLine, LineCheckKind } from "../../../../src/4-playlists/4.1-definition-of-a-playlist.js";
import {
    checkIdentification,
    EXTM3U_TAG_NAME,
    extm3uRules,
    extm3uSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";

describe("extm3uSchema", () => {
    test("converts the valueless tag to true", () => {
        const result = extm3uSchema.safeParse(true);
        expect(result).toEqual({ success: true, data: true });
    });

    test.each(["", "3", "VERSION=3"])("rejects the value %j", (value) => {
        const result = extm3uSchema.safeParse(value);
        expect(result.success).toBe(false);
    });
});

describe("checkIdentification", () => {
    test("accepts an EXTM3U first line", () => {
        const firstLine = classifyLine(`#${EXTM3U_TAG_NAME}`);
        expect(checkIdentification(firstLine)).toEqual({ kind: LineCheckKind.valid });
    });

    test.each(["#EXT-X-VERSION:3", "#extm3u", "# EXTM3U", "segment.ts", ""])("reports the first line %j", (line) => {
        const firstLine = classifyLine(line);
        const check = checkIdentification(firstLine);
        expect(check).toMatchObject({ kind: LineCheckKind.malformed, issue: { rule: extm3uRules.identification } });
    });
});
