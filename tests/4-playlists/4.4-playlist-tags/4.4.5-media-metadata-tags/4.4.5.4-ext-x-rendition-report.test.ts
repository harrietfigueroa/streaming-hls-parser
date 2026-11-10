// These tests pin section 4.4.5.4: EXT-X-RENDITION-REPORT's attributes
// convert, any of them may be omitted, and its URI is relative.
import { describe, expect, test } from "vitest";

import {
    checkRenditionReport,
    extXRenditionReportRules,
    extXRenditionReportSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.4-ext-x-rendition-report.js";

describe("extXRenditionReportSchema", () => {
    test.each([
        { attributes: { URI: '"/1M/LL-HLS.m3u8"', "LAST-MSN": "274", "LAST-PART": "1" }, report: { URI: "/1M/LL-HLS.m3u8", "LAST-MSN": 274n, "LAST-PART": 1n } },
        { attributes: {}, report: {} },
    ])("converts $attributes", ({ attributes, report }) => {
        expect(extXRenditionReportSchema.safeParse(attributes)).toEqual({ success: true, data: report });
    });
});

describe("checkRenditionReport", () => {
    test.each(["/1M/LL-HLS.m3u8", "../a.m3u8", "a.m3u8"])("accepts the relative URI %s", (URI) => {
        expect(checkRenditionReport({ URI })).toEqual([]);
    });

    test("reports an absolute URI", () => {
        const issues = checkRenditionReport({ URI: "https://example.com/a.m3u8" });
        expect(issues).toMatchObject([{ rule: extXRenditionReportRules.relativeUri }]);
    });
});
