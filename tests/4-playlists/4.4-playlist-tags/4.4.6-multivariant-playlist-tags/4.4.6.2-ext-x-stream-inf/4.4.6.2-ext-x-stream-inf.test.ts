// These tests pin section 4.4.6.2: EXT-X-STREAM-INF's attributes convert,
// REQ-VIDEO-LAYOUT parses into View Presentation Entries, a layout with an
// unrecognized specifier marks the tag for 6.3.1's whole-tag ignore, and each
// Rendition Group attribute names a Group of its TYPE.
import { describe, expect, test } from "vitest";

import {
    MediaType,
} from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import {
    checkRenditionReferences,
    extXStreamInfIgnoreReason,
    extXStreamInfRules,
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

describe("checkRenditionReferences", () => {
    const media = [
        { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "English" },
        { TYPE: MediaType.video, "GROUP-ID": "low", NAME: "Main" },
        { TYPE: MediaType.subtitles, "GROUP-ID": "subs", NAME: "English", URI: "s.m3u8" },
        { TYPE: MediaType.closedCaptions, "GROUP-ID": "cc", NAME: "English", "INSTREAM-ID": "CC1" },
    ] as const;

    test("accepts variants and I-frame streams naming existing Groups of their TYPE", () => {
        const streamInfs = [
            { BANDWIDTH: 1n, AUDIO: "aac", VIDEO: "low", SUBTITLES: "subs", "CLOSED-CAPTIONS": "cc" },
            { BANDWIDTH: 2n, AUDIO: "aac" },
        ] as const;
        const iFrameStreamInfs = [{ BANDWIDTH: 1n, URI: "i.m3u8", VIDEO: "low" }] as const;
        expect(checkRenditionReferences({ streamInfs, iFrameStreamInfs, media })).toEqual([]);
    });

    test("accepts CLOSED-CAPTIONS=NONE on every variant", () => {
        const streamInfs = [
            { BANDWIDTH: 1n, "CLOSED-CAPTIONS": "NONE" },
            { BANDWIDTH: 2n, "CLOSED-CAPTIONS": "NONE" },
        ] as const;
        expect(checkRenditionReferences({ streamInfs, iFrameStreamInfs: [], media })).toEqual([]);
    });

    const broken = [
        { name: "an AUDIO naming no Group", streamInfs: [{ BANDWIDTH: 1n, AUDIO: "ac3" }], iFrameStreamInfs: [], rule: extXStreamInfRules.groupReference },
        { name: "a VIDEO naming a Group of another TYPE", streamInfs: [{ BANDWIDTH: 1n, VIDEO: "aac" }], iFrameStreamInfs: [], rule: extXStreamInfRules.groupReference },
        { name: "a SUBTITLES naming no Group", streamInfs: [{ BANDWIDTH: 1n, SUBTITLES: "aac" }], iFrameStreamInfs: [], rule: extXStreamInfRules.groupReference },
        { name: "a CLOSED-CAPTIONS naming no Group", streamInfs: [{ BANDWIDTH: 1n, "CLOSED-CAPTIONS": "cc2" }], iFrameStreamInfs: [], rule: extXStreamInfRules.groupReference },
        { name: "an I-frame stream's VIDEO naming no Group", streamInfs: [], iFrameStreamInfs: [{ BANDWIDTH: 1n, URI: "i.m3u8", VIDEO: "hi" }], rule: extXStreamInfRules.groupReference },
        {
            name: "CLOSED-CAPTIONS=NONE on one variant only",
            streamInfs: [{ BANDWIDTH: 1n, "CLOSED-CAPTIONS": "NONE" }, { BANDWIDTH: 2n }],
            iFrameStreamInfs: [],
            rule: extXStreamInfRules.closedCaptionsNoneEverywhere,
        },
    ] as const;

    test.each(broken)("reports $name", ({ streamInfs, iFrameStreamInfs, rule }) => {
        expect(checkRenditionReferences({ streamInfs, iFrameStreamInfs, media })).toMatchObject([{ rule }]);
    });
});
