// These tests pin section 4.4.6.2: EXT-X-STREAM-INF's attributes convert,
// REQ-VIDEO-LAYOUT parses into View Presentation Entries, and a layout with an
// unrecognized specifier marks the tag for 6.3.1's whole-tag ignore.
import { describe, expect, test } from "vitest";

import {
    extXStreamInfIgnoreReason,
    extXStreamInfSchema,
    HdcpLevel,
    VideoLayout,
    VideoRange,
} from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";

describe("extXStreamInfSchema", () => {
    test("converts every attribute", () => {
        const attributes = {
            BANDWIDTH: "1280000",
            "AVERAGE-BANDWIDTH": "1000000",
            SCORE: "1.5",
            CODECS: '"avc1.4d401e,mp4a.40.2"',
            "SUPPLEMENTAL-CODECS": '"dvh1.08.07/db4h"',
            RESOLUTION: "1920x1080",
            "FRAME-RATE": "29.97",
            "HDCP-LEVEL": "TYPE-0",
            "ALLOWED-CPC": '"com.example.drm1:SMART-TV/PC"',
            "VIDEO-RANGE": "PQ",
            "REQ-VIDEO-LAYOUT": '"CH-STEREO/PROJ-EQUI,CH-MONO"',
            "STABLE-VARIANT-ID": '"hi+res=1"',
            AUDIO: '"aac"',
            VIDEO: '"cam"',
            SUBTITLES: '"subs"',
            "CLOSED-CAPTIONS": "NONE",
            "PATHWAY-ID": '"CDN-A"',
        };
        const streamInf = {
            BANDWIDTH: 1280000n,
            "AVERAGE-BANDWIDTH": 1000000n,
            SCORE: 1.5,
            CODECS: "avc1.4d401e,mp4a.40.2",
            "SUPPLEMENTAL-CODECS": "dvh1.08.07/db4h",
            RESOLUTION: { width: 1920n, height: 1080n },
            "FRAME-RATE": 29.97,
            "HDCP-LEVEL": HdcpLevel.type0,
            "ALLOWED-CPC": "com.example.drm1:SMART-TV/PC",
            "VIDEO-RANGE": VideoRange.pq,
            "REQ-VIDEO-LAYOUT": [[VideoLayout.stereo, VideoLayout.equirectangular], [VideoLayout.mono]],
            "STABLE-VARIANT-ID": "hi+res=1",
            AUDIO: "aac",
            VIDEO: "cam",
            SUBTITLES: "subs",
            "CLOSED-CAPTIONS": "NONE",
            "PATHWAY-ID": "CDN-A",
        };
        expect(extXStreamInfSchema.safeParse(attributes)).toEqual({ success: true, data: streamInf });
    });

    test.each([
        {},
        { BANDWIDTH: "1", SCORE: "0" },
        { BANDWIDTH: "1", "STABLE-VARIANT-ID": '"a b"' },
        { BANDWIDTH: "1", "REQ-VIDEO-LAYOUT": '""' },
        { BANDWIDTH: "1", "REQ-VIDEO-LAYOUT": '"CH-STEREO,"' },
        { BANDWIDTH: "1", "REQ-VIDEO-LAYOUT": '"CH-STEREO/CH-MONO"' },
    ])("rejects %j", (attributes) => {
        expect(extXStreamInfSchema.safeParse(attributes).success).toBe(false);
    });

    test("marks an unrecognized REQ-VIDEO-LAYOUT specifier with the reason to ignore the tag", () => {
        const result = extXStreamInfSchema.safeParse({ BANDWIDTH: "1", "REQ-VIDEO-LAYOUT": '"CH-STEREO/PROJ-FUTURE"' });
        expect(result.error?.issues).toMatchObject([{ code: "custom", params: { ignoreReason: extXStreamInfIgnoreReason } }]);
    });
});
