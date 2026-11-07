// These tests pin section 4.4.6.4: EXT-X-SESSION-DATA's attributes convert,
// each tag carries exactly one of VALUE and URI, and no two tags share a
// DATA-ID and LANGUAGE. Each case breaks one rule once.
import { describe, expect, test } from "vitest";

import {
    checkSessionData,
    extXSessionDataRules,
    extXSessionDataSchema,
    SessionDataFormat,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.4-ext-x-session-data.js";

describe("extXSessionDataSchema", () => {
    // Section 9.8's examples.
    test.each([
        { attributes: { "DATA-ID": '"com.example.lyrics"', URI: '"lyrics.json"' }, sessionData: { "DATA-ID": "com.example.lyrics", URI: "lyrics.json" } },
        {
            attributes: { "DATA-ID": '"com.example.title"', LANGUAGE: '"en"', VALUE: '"This is an example"' },
            sessionData: { "DATA-ID": "com.example.title", LANGUAGE: "en", VALUE: "This is an example" },
        },
    ])("converts $attributes", ({ attributes, sessionData }) => {
        expect(extXSessionDataSchema.safeParse(attributes)).toEqual({ success: true, data: sessionData });
    });

    test("converts FORMAT", () => {
        const result = extXSessionDataSchema.safeParse({ "DATA-ID": '"a"', URI: '"a.bin"', FORMAT: "RAW" });
        expect(result).toMatchObject({ success: true, data: { FORMAT: SessionDataFormat.raw } });
    });

    test.each([{ VALUE: '"a"' }, { "DATA-ID": "a", VALUE: '"a"' }])("rejects %j", (attributes) => {
        expect(extXSessionDataSchema.safeParse(attributes).success).toBe(false);
    });
});

describe("checkSessionData", () => {
    test("accepts one DATA-ID in several languages", () => {
        const sessionData = [
            { "DATA-ID": "com.example.title", LANGUAGE: "en", VALUE: "This is an example" },
            { "DATA-ID": "com.example.title", LANGUAGE: "es", VALUE: "Este es un ejemplo" },
            { "DATA-ID": "com.example.lyrics", URI: "lyrics.json" },
        ] as const;
        expect(checkSessionData(sessionData)).toEqual([]);
    });

    const broken = [
        { name: "a tag with VALUE and URI", sessionData: [{ "DATA-ID": "a", VALUE: "v", URI: "u" }], rule: extXSessionDataRules.valueOrUri },
        { name: "a tag with neither VALUE nor URI", sessionData: [{ "DATA-ID": "a" }], rule: extXSessionDataRules.valueOrUri },
        {
            name: "two tags with one DATA-ID and LANGUAGE",
            sessionData: [{ "DATA-ID": "a", LANGUAGE: "en", VALUE: "1" }, { "DATA-ID": "a", LANGUAGE: "en", VALUE: "2" }],
            rule: extXSessionDataRules.distinctDataIdLanguage,
        },
        {
            name: "two tags with one DATA-ID and no LANGUAGE",
            sessionData: [{ "DATA-ID": "a", VALUE: "1" }, { "DATA-ID": "a", URI: "u" }],
            rule: extXSessionDataRules.distinctDataIdLanguage,
        },
    ] as const;

    test.each(broken)("reports $name", ({ sessionData, rule }) => {
        expect(checkSessionData(sessionData)).toMatchObject([{ rule }]);
    });
});
