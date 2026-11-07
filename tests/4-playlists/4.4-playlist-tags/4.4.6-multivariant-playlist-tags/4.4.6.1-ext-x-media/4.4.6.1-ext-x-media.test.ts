// These tests pin section 4.4.6.1: EXT-X-MEDIA's attributes convert, CHANNELS
// and CHARACTERISTICS split into their parameters, and each rule the section
// sets between TYPE and the other attributes is broken once.
import { describe, expect, test } from "vitest";

import {
    checkMedia,
    extXMediaRules,
    extXMediaSchema,
    MediaType,
    YesNo,
} from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";

const REQUIRED_ATTRIBUTES = { TYPE: "AUDIO", "GROUP-ID": '"aac"', NAME: '"English"' } as const;

describe("extXMediaSchema", () => {
    test("converts the spec's Norwegian subtitles example", () => {
        const attributes = {
            TYPE: "SUBTITLES",
            "GROUP-ID": '"subtitles"',
            NAME: '"Bokmael"',
            AUTOSELECT: "YES",
            LANGUAGE: '"nb"',
            "ASSOC-LANGUAGE": '"no"',
            URI: '"nb-subtitles.m3u8"',
        };
        const media = {
            TYPE: MediaType.subtitles,
            "GROUP-ID": "subtitles",
            NAME: "Bokmael",
            AUTOSELECT: YesNo.yes,
            LANGUAGE: "nb",
            "ASSOC-LANGUAGE": "no",
            URI: "nb-subtitles.m3u8",
        };
        expect(extXMediaSchema.safeParse(attributes)).toEqual({ success: true, data: media });
    });

    test("converts the audio attributes", () => {
        const attributes = { ...REQUIRED_ATTRIBUTES, "BIT-DEPTH": "24", "SAMPLE-RATE": "48000", "STABLE-RENDITION-ID": '"en.aac-2/a=b_c"' };
        const result = extXMediaSchema.safeParse(attributes);
        expect(result).toMatchObject({ success: true, data: { "BIT-DEPTH": 24n, "SAMPLE-RATE": 48000n, "STABLE-RENDITION-ID": "en.aac-2/a=b_c" } });
    });

    test("splits CHARACTERISTICS into its Media Characteristic Tags", () => {
        const attributes = { ...REQUIRED_ATTRIBUTES, CHARACTERISTICS: '"public.accessibility.describes-video,public.machine-generated"' };
        const characteristics = ["public.accessibility.describes-video", "public.machine-generated"];
        expect(extXMediaSchema.safeParse(attributes)).toMatchObject({ success: true, data: { CHARACTERISTICS: characteristics } });
    });

    test.each([
        { channels: '"2"', converted: { count: 2n } },
        { channels: '"2/"', converted: { count: 2n, audioCodingIdentifiers: [] } },
        { channels: '"6/-"', converted: { count: 6n, audioCodingIdentifiers: ["-"] } },
        { channels: '"16/JOC"', converted: { count: 16n, audioCodingIdentifiers: ["JOC"] } },
        {
            channels: '"12/3OA,JOC/BINAURAL,BED-4"',
            converted: { count: 12n, audioCodingIdentifiers: ["3OA", "JOC"], specialUsageIdentifiers: ["BINAURAL", "BED-4"] },
        },
    ])("converts CHANNELS=$channels", ({ channels, converted }) => {
        const result = extXMediaSchema.safeParse({ ...REQUIRED_ATTRIBUTES, CHANNELS: channels });
        expect(result).toEqual({ success: true, data: { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "English", CHANNELS: converted } });
    });

    test.each([
        { TYPE: "AUDIO", "GROUP-ID": '"aac"' },
        { TYPE: "AUDIO", NAME: '"English"' },
        { "GROUP-ID": '"aac"', NAME: '"English"' },
        { ...REQUIRED_ATTRIBUTES, CHANNELS: '"two"' },
        { ...REQUIRED_ATTRIBUTES, CHANNELS: '"2//BINAURAL"' },
        { ...REQUIRED_ATTRIBUTES, CHANNELS: '"2/joc"' },
        { ...REQUIRED_ATTRIBUTES, CHANNELS: '"2/JOC,"' },
        { ...REQUIRED_ATTRIBUTES, CHANNELS: '"2/JOC/BINAURAL/"' },
        { ...REQUIRED_ATTRIBUTES, CHARACTERISTICS: '"public.easy-to-read,,public.machine-generated"' },
        { ...REQUIRED_ATTRIBUTES, "STABLE-RENDITION-ID": '"en aac"' },
        { ...REQUIRED_ATTRIBUTES, "BIT-DEPTH": "-1" },
    ])("rejects %j", (attributes) => {
        expect(extXMediaSchema.safeParse(attributes).success).toBe(false);
    });
});

describe("checkMedia", () => {
    const audio = { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "English" } as const;
    const video = { TYPE: MediaType.video, "GROUP-ID": "v", NAME: "Main" } as const;
    const subtitles = { TYPE: MediaType.subtitles, "GROUP-ID": "s", NAME: "English", URI: "s.m3u8" } as const;
    const closedCaptions = { TYPE: MediaType.closedCaptions, "GROUP-ID": "cc", NAME: "English" } as const;

    test.each([
        { name: "AUDIO with every audio attribute", media: { ...audio, "BIT-DEPTH": 24n, "SAMPLE-RATE": 48000n, CHANNELS: { count: 2n }, "INSTREAM-ID": "1.a" } },
        { name: "DEFAULT=YES without AUTOSELECT", media: { ...audio, DEFAULT: YesNo.yes } },
        { name: "DEFAULT=YES with AUTOSELECT=YES", media: { ...audio, DEFAULT: YesNo.yes, AUTOSELECT: YesNo.yes } },
        { name: "FORCED on SUBTITLES", media: { ...subtitles, FORCED: YesNo.yes } },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID CC1", media: { ...closedCaptions, "INSTREAM-ID": "CC1" } },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID CC4", media: { ...closedCaptions, "INSTREAM-ID": "CC4" } },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID SERVICE1", media: { ...closedCaptions, "INSTREAM-ID": "SERVICE1" } },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID SERVICE63", media: { ...closedCaptions, "INSTREAM-ID": "SERVICE63" } },
    ] as const)("accepts $name", ({ media }) => {
        expect(checkMedia(media)).toEqual([]);
    });

    test.each([
        { name: "CLOSED-CAPTIONS with a URI", media: { ...closedCaptions, "INSTREAM-ID": "CC1", URI: "cc.m3u8" }, rule: extXMediaRules.closedCaptionsUri },
        { name: "CLOSED-CAPTIONS without INSTREAM-ID", media: closedCaptions, rule: extXMediaRules.closedCaptionsInstreamId },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID CC5", media: { ...closedCaptions, "INSTREAM-ID": "CC5" }, rule: extXMediaRules.closedCaptionsInstreamId },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID SERVICE0", media: { ...closedCaptions, "INSTREAM-ID": "SERVICE0" }, rule: extXMediaRules.closedCaptionsInstreamId },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID SERVICE64", media: { ...closedCaptions, "INSTREAM-ID": "SERVICE64" }, rule: extXMediaRules.closedCaptionsInstreamId },
        { name: "CLOSED-CAPTIONS with INSTREAM-ID SERVICE09", media: { ...closedCaptions, "INSTREAM-ID": "SERVICE09" }, rule: extXMediaRules.closedCaptionsInstreamId },
        { name: "AUDIO with an INSTREAM-ID outside its characters", media: { ...audio, "INSTREAM-ID": "a_b" }, rule: extXMediaRules.instreamIdCharacters },
        { name: "DEFAULT=YES with AUTOSELECT=NO", media: { ...audio, DEFAULT: YesNo.yes, AUTOSELECT: YesNo.no }, rule: extXMediaRules.autoselectWithDefault },
        { name: "FORCED on AUDIO", media: { ...audio, FORCED: YesNo.no }, rule: extXMediaRules.forcedSubtitlesOnly },
        { name: "BIT-DEPTH on VIDEO", media: { ...video, "BIT-DEPTH": 8n }, rule: extXMediaRules.audioOnly },
        { name: "SAMPLE-RATE on VIDEO", media: { ...video, "SAMPLE-RATE": 48000n }, rule: extXMediaRules.audioOnly },
        { name: "CHANNELS on SUBTITLES", media: { ...subtitles, CHANNELS: { count: 2n } }, rule: extXMediaRules.audioOnly },
    ] as const)("reports $name", ({ media, rule }) => {
        expect(checkMedia(media)).toMatchObject([{ rule }]);
    });
});
