// These tests pin section 4.4.6.6: EXT-X-CONTENT-STEERING's attributes
// convert, and its PATHWAY-ID names a Pathway some variant is on.
import { describe, expect, test } from "vitest";

import {
    checkContentSteering,
    extXContentSteeringRules,
    extXContentSteeringSchema,
} from "../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.6-ext-x-content-steering.js";

describe("extXContentSteeringSchema", () => {
    test("converts section 9.11's example", () => {
        const result = extXContentSteeringSchema.safeParse({ "SERVER-URI": '"/steering?video=00012"', "PATHWAY-ID": '"CDN-A"' });
        expect(result).toEqual({ success: true, data: { "SERVER-URI": "/steering?video=00012", "PATHWAY-ID": "CDN-A" } });
    });

    test("rejects a missing SERVER-URI", () => {
        expect(extXContentSteeringSchema.safeParse({ "PATHWAY-ID": '"CDN-A"' }).success).toBe(false);
    });
});

describe("checkContentSteering", () => {
    test.each([
        { name: "no PATHWAY-ID", contentSteering: { "SERVER-URI": "s" }, streamInfs: [{ BANDWIDTH: 1n }] },
        { name: "a variant's PATHWAY-ID", contentSteering: { "SERVER-URI": "s", "PATHWAY-ID": "CDN-B" }, streamInfs: [{ BANDWIDTH: 1n, "PATHWAY-ID": "CDN-A" }, { BANDWIDTH: 1n, "PATHWAY-ID": "CDN-B" }] },
        { name: "the default Pathway of a variant without PATHWAY-ID", contentSteering: { "SERVER-URI": "s", "PATHWAY-ID": "." }, streamInfs: [{ BANDWIDTH: 1n }] },
    ] as const)("accepts $name", ({ contentSteering, streamInfs }) => {
        expect(checkContentSteering({ contentSteering, streamInfs })).toEqual([]);
    });

    test("reports a PATHWAY-ID no variant is on", () => {
        const contentSteering = { "SERVER-URI": "s", "PATHWAY-ID": "CDN-C" } as const;
        const streamInfs = [{ BANDWIDTH: 1n, "PATHWAY-ID": "CDN-A" }] as const;
        expect(checkContentSteering({ contentSteering, streamInfs })).toMatchObject([{ rule: extXContentSteeringRules.pathwayOfVariant }]);
    });
});
