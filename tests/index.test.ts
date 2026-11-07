// These tests pin the static Media Playlist path through the default entry:
// section 9.1's example parses to its typed playlist, ignored lines keep their
// position, and each malformed case breaks exactly one rule of a valid base.
import { describe, expect, test } from "vitest";

import { HLS, IgnoredKind, Limit, type MediaPlaylist, type MultivariantPlaylist, ParseKind, PlaylistKind } from "../src/index.js";
import {
    extXStreamInfIgnoreReason,
    extXStreamInfRules,
} from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf.js";
import { multivariantPlaylistTagRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6-multivariant-playlist-tags.js";
import { AssertionError } from "../src/library/assert.js";
import { attributeListRules } from "../src/4-playlists/4.2-attribute-lists.js";
import { extXStartRules } from "../src/4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.2-ext-x-start.js";
import { ignoreReasons } from "../src/6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { generalClientRules } from "../src/6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { extXDefineRules } from "../src/4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.3-ext-x-define.js";
import { extXMediaSequenceRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.2-ext-x-media-sequence.js";
import { extXDiscontinuitySequenceRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.3-ext-x-discontinuity-sequence.js";
import { PlaylistType } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.5-ext-x-playlist-type.js";
import { extXServerControlRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.8-ext-x-server-control.js";
import { extXByteRangeRules } from "../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.2-ext-x-byterange.js";
import { extXKeyRules, KeyMethod } from "../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.4-ext-x-key.js";
import { extXPartRules } from "../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.9-ext-x-part.js";
import { extXPartInfRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.7-ext-x-part-inf.js";
import {
    extXDateRangeIgnoreReason,
    extXDateRangeRules,
} from "../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.1-ext-x-daterange.js";
import { extXSkipRules } from "../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.2-ext-x-skip.js";
import { extXPreloadHintRules } from "../src/4-playlists/4.4-playlist-tags/4.4.5-media-metadata-tags/4.4.5.3-ext-x-preload-hint.js";
import { definitionRules } from "../src/4-playlists/4.1-definition-of-a-playlist.js";
import { extm3uRules } from "../src/4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import { extXVersionRules } from "../src/4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.2-ext-x-version.js";
import { mediaPlaylistTagRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3-media-playlist-tags.js";
import { extXTargetDurationRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { mediaSegmentTagRules } from "../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4-media-segment-tags.js";
import { extinfRules } from "../src/4-playlists/4.4-playlist-tags/4.4.4-media-segment-tags/4.4.4.1-extinf.js";

const BYTE_ORDER_MARK = "﻿";

// Section 9.1, Simple Media Playlist.
const SIMPLE_MEDIA_PLAYLIST = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXTINF:9.009,
http://media.example.com/first.ts
#EXTINF:9.009,
http://media.example.com/second.ts
#EXTINF:3.003,
http://media.example.com/third.ts
#EXT-X-ENDLIST
`;

const simpleMediaPlaylist: MediaPlaylist = {
    kind: PlaylistKind.media,
    EXTM3U: true,
    "EXT-X-TARGETDURATION": 10n,
    "EXT-X-VERSION": 3n,
    "EXT-X-ENDLIST": true,
    segments: [
        { uri: "http://media.example.com/first.ts", EXTINF: { duration: 9.009 }, ignored: [] },
        { uri: "http://media.example.com/second.ts", EXTINF: { duration: 9.009 }, ignored: [] },
        { uri: "http://media.example.com/third.ts", EXTINF: { duration: 3.003 }, ignored: [] },
    ],
    ignored: [],
};

describe("HLS.safeParse", () => {
    test("parses section 9.1's Simple Media Playlist", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST);
        expect(outcome).toEqual({ kind: ParseKind.parsed, playlist: simpleMediaPlaylist, violations: [] });
    });

    test("freezes the playlist and its segments", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST);
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { kind: PlaylistKind.media } });
        const isMediaPlaylist = outcome.kind === ParseKind.parsed && outcome.playlist.kind === PlaylistKind.media;
        if (isMediaPlaylist) {
            expect(Object.isFrozen(outcome.playlist)).toBe(true);
            expect(Object.isFrozen(outcome.playlist.segments)).toBe(true);
            expect(Object.isFrozen(outcome.playlist.segments[0])).toBe(true);
        }
    });

    test("keeps comments and unrecognized tags on the next segment, and trailing ones on the playlist", () => {
        const text = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n# a comment\n#EXT-X-FUTURE:1\n#EXTINF:1,\na.ts\n# last\n";
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                segments: [
                    {
                        uri: "a.ts",
                        ignored: [
                            { kind: IgnoredKind.comment, line: "# a comment" },
                            { kind: IgnoredKind.unrecognizedTag, line: "#EXT-X-FUTURE:1" },
                        ],
                    },
                ],
                ignored: [{ kind: IgnoredKind.comment, line: "# last" }],
            },
        });
    });

    test("converts every Media Playlist tag", () => {
        const text = [
            "#EXTM3U",
            "#EXT-X-TARGETDURATION:4",
            "#EXT-X-MEDIA-SEQUENCE:2680",
            "#EXT-X-DISCONTINUITY-SEQUENCE:3",
            "#EXT-X-PLAYLIST-TYPE:EVENT",
            "#EXT-X-I-FRAMES-ONLY",
            "#EXT-X-PART-INF:PART-TARGET=1.004",
            "#EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=3.012",
            "#EXTINF:4,",
            "a.ts",
            "",
        ].join("\n");
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                "EXT-X-MEDIA-SEQUENCE": 2680n,
                "EXT-X-DISCONTINUITY-SEQUENCE": 3n,
                "EXT-X-PLAYLIST-TYPE": PlaylistType.event,
                "EXT-X-I-FRAMES-ONLY": true,
                "EXT-X-PART-INF": { "PART-TARGET": 1.004 },
                "EXT-X-SERVER-CONTROL": { "CAN-BLOCK-RELOAD": "YES", "PART-HOLD-BACK": 3.012 },
            },
        });
    });

    test("converts the segment tags each segment carries", () => {
        const text = [
            "#EXTM3U",
            "#EXT-X-TARGETDURATION:10",
            "#EXT-X-BITRATE:1500",
            "#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00",
            "#EXT-X-BYTERANGE:100@0",
            "#EXTINF:10,",
            "a.ts",
            "#EXT-X-DISCONTINUITY",
            "#EXT-X-GAP",
            "#EXT-X-BYTERANGE:100",
            "#EXTINF:10,",
            "a.ts",
            "",
        ].join("\n");
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                segments: [
                    {
                        "EXT-X-BITRATE": 1500n,
                        "EXT-X-PROGRAM-DATE-TIME": "2010-02-19T14:54:23.031+08:00",
                        "EXT-X-BYTERANGE": { length: 100n, offset: 0n },
                    },
                    { "EXT-X-DISCONTINUITY": true, "EXT-X-GAP": true, "EXT-X-BYTERANGE": { length: 100n } },
                ],
            },
        });
    });

    test("keeps every EXT-X-KEY before a segment, and its EXT-X-MAP", () => {
        const text = [
            "#EXTM3U",
            "#EXT-X-TARGETDURATION:10",
            '#EXT-X-MAP:URI="init.mp4"',
            '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://a",KEYFORMAT="com.apple.streamingkeydelivery"',
            '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="data:text/plain;base64,AA",KEYFORMAT="urn:uuid:edef8ba9"',
            "#EXTINF:10,",
            "a.mp4",
            "",
        ].join("\n");
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                segments: [
                    {
                        "EXT-X-MAP": { URI: "init.mp4" },
                        "EXT-X-KEY": [
                            { METHOD: KeyMethod.sampleAes, KEYFORMAT: "com.apple.streamingkeydelivery" },
                            { METHOD: KeyMethod.sampleAes, KEYFORMAT: "urn:uuid:edef8ba9" },
                        ],
                    },
                ],
            },
        });
    });

    // Section 9.11's excerpt, with the head lines its "..." stands for.
    const LOW_LATENCY_PLAYLIST = [
        "#EXTM3U",
        "#EXT-X-TARGETDURATION:4",
        "#EXT-X-PART-INF:PART-TARGET=2.00004",
        "#EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=6.00012",
        "#EXT-X-MEDIA-SEQUENCE:270",
        "#EXTINF:4.00008,",
        "fileSequence270.mp4",
        '#EXT-X-PART:DURATION=2.00004,INDEPENDENT=YES,URI="filePart271.0.mp4"',
        '#EXT-X-PART:DURATION=2.00004,URI="filePart271.1.mp4"',
        "#EXTINF:4.00008,",
        "fileSequence271.mp4",
        '#EXT-X-PART:DURATION=2.00004,INDEPENDENT=YES,URI="filePart272.0.mp4"',
        '#EXT-X-PART:DURATION=0.50001,URI="filePart272.1.mp4"',
        "#EXTINF:2.50005,",
        "fileSequence272.mp4",
        "#EXT-X-DISCONTINUITY",
        '#EXT-X-PART:DURATION=2.00004,INDEPENDENT=YES,URI="midRoll273.0.mp4"',
        '#EXT-X-PART:DURATION=2.00004,URI="midRoll273.1.mp4"',
        "#EXTINF:4.00008,",
        "midRoll273.mp4",
        '#EXT-X-PART:DURATION=2.00004,INDEPENDENT=YES,URI="midRoll274.0.mp4"',
        '#EXT-X-PRELOAD-HINT:TYPE=PART,URI="midRoll274.1.mp4"',
        '#EXT-X-RENDITION-REPORT:URI="/1M/LL-HLS.m3u8",LAST-MSN=274,LAST-PART=1',
        "",
    ];

    test("keeps the parts after the last URI as the pending Parent Segment", () => {
        const outcome = HLS.safeParse(LOW_LATENCY_PLAYLIST.join("\n"));
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                segments: [
                    { uri: "fileSequence270.mp4" },
                    { uri: "fileSequence271.mp4", "EXT-X-PART": [{ URI: "filePart271.0.mp4" }, { URI: "filePart271.1.mp4" }] },
                    { uri: "fileSequence272.mp4" },
                    { uri: "midRoll273.mp4", "EXT-X-DISCONTINUITY": true },
                ],
                pendingSegment: { "EXT-X-PART": [{ URI: "midRoll274.0.mp4", DURATION: 2.00004, INDEPENDENT: "YES" }] },
                "EXT-X-PRELOAD-HINT": [{ TYPE: "PART", URI: "midRoll274.1.mp4" }],
                "EXT-X-RENDITION-REPORT": [{ URI: "/1M/LL-HLS.m3u8", "LAST-MSN": 274n, "LAST-PART": 1n }],
            },
        });
    });

    test("reports a part-related rule broken in the Low-Latency playlist", () => {
        const withoutPartInf = LOW_LATENCY_PLAYLIST.filter(isNotPartInf);
        const outcome = HLS.safeParse(withoutPartInf.join("\n"));
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule: extXPartInfRules.requiredWithParts }] });
    });

    test("keeps every Date Range on the playlist", () => {
        const text = [
            "#EXTM3U",
            "#EXT-X-TARGETDURATION:10",
            "#EXT-X-PROGRAM-DATE-TIME:2014-03-05T11:14:00Z",
            '#EXT-X-DATERANGE:ID="ad",START-DATE="2014-03-05T11:15:00Z",PLANNED-DURATION=60,X-AD-ID="XYZ"',
            "#EXTINF:10,",
            "a.ts",
            '#EXT-X-DATERANGE:ID="ad",DURATION=60',
            "",
        ].join("\n");
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                "EXT-X-DATERANGE": [
                    { ID: "ad", "START-DATE": "2014-03-05T11:15:00Z", clientAttributes: { "X-AD-ID": "XYZ" } },
                    { ID: "ad", DURATION: 60 },
                ],
            },
        });
    });

    test.each([
        '#EXT-X-DATERANGE:START-DATE="2014-03-05T11:15:00Z"',
        '#EXT-X-DATERANGE:ID="ad",ID="ad"',
    ])("ignores the Date Range %s, whose syntax is illegal", (dateRange) => {
        const text = `#EXTM3U\n#EXT-X-TARGETDURATION:10\n${dateRange}\n`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: { ignored: [{ kind: IgnoredKind.ignoredTag, line: dateRange, reason: extXDateRangeIgnoreReason }] },
        });
    });

    test("skips blank lines", () => {
        const text = "#EXTM3U\n\n#EXT-X-TARGETDURATION:10\n\n#EXTINF:1,\n\na.ts\n";
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { segments: [{ uri: "a.ts" }] } });
    });

    test("converts playlist attribute-list tags, keeping unrecognized attributes on the tag", () => {
        const text = "#EXTM3U\n#EXT-X-INDEPENDENT-SEGMENTS\n#EXT-X-START:TIME-OFFSET=-3,FUTURE=1\n#EXT-X-TARGETDURATION:10\n";
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: { "EXT-X-INDEPENDENT-SEGMENTS": true, "EXT-X-START": { "TIME-OFFSET": -3, ignored: ["FUTURE=1"] } },
        });
    });

    // A tag 6.3.1 says to ignore is kept in position among the unit's other ignored lines.
    const ignoredTags = [
        { name: "an unrecognized REQ- attribute", start: "#EXT-X-START:TIME-OFFSET=1,REQ-FUTURE=1", reason: ignoreReasons.unrecognizedRequiredAttribute },
        { name: "an unrecognized enumerated-string", start: "#EXT-X-START:TIME-OFFSET=1,PRECISE=MAYBE", reason: ignoreReasons.unrecognizedEnumeratedValue },
    ] as const;

    test("keeps an ignored playlist tag on the segment after it", () => {
        const start = "#EXT-X-START:TIME-OFFSET=1,PRECISE=MAYBE";
        const text = `#EXTM3U\n#EXT-X-TARGETDURATION:10\n${start}\n#EXTINF:1,\na.ts\n`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                segments: [{ ignored: [{ kind: IgnoredKind.ignoredTag, line: start }] }],
                ignored: [],
            },
        });
    });

    test.each(ignoredTags)("ignores a tag with $name", ({ start, reason }) => {
        const text = `#EXTM3U\n# before\n${start}\n# after\n#EXT-X-TARGETDURATION:10\n`;
        const outcome = HLS.safeParse(text);
        expect(outcome.kind).toBe(ParseKind.parsed);
        if (outcome.kind === ParseKind.parsed) {
            expect(outcome.playlist).not.toHaveProperty("EXT-X-START");
            expect(outcome.playlist.ignored).toEqual([
                { kind: IgnoredKind.comment, line: "# before" },
                { kind: IgnoredKind.ignoredTag, line: start, reason },
                { kind: IgnoredKind.comment, line: "# after" },
            ]);
        }
    });

    // Each case breaks one line of a valid base: EXTM3U, a Target Duration of 10, one segment.
    const BASE_HEAD = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n";
    const BASE_SEGMENT = "#EXTINF:9.009,\na.ts\n";
    const malformed = [
        { name: "an empty playlist", text: "", rule: extm3uRules.identification },
        { name: "a missing EXTM3U", text: `#EXT-X-TARGETDURATION:10\n${BASE_SEGMENT}`, rule: extm3uRules.identification },
        { name: "a second EXTM3U", text: `${BASE_HEAD}#EXTM3U\n${BASE_SEGMENT}`, rule: extm3uRules.identification },
        { name: "an EXTM3U value", text: `#EXTM3U:1\n#EXT-X-TARGETDURATION:10\n${BASE_SEGMENT}`, rule: extm3uRules.format },
        { name: "a Byte Order Mark", text: `${BYTE_ORDER_MARK}${BASE_HEAD}${BASE_SEGMENT}`, rule: definitionRules.noByteOrderMark },
        { name: "a control character", text: `${BASE_HEAD}#EXTINF:9.009,\na\u0007.ts\n`, rule: definitionRules.noControlCharacters },
        { name: "a second EXT-X-VERSION", text: `${BASE_HEAD}#EXT-X-VERSION:3\n#EXT-X-VERSION:3\n${BASE_SEGMENT}`, rule: extXVersionRules.singleTag },
        { name: "a second EXT-X-TARGETDURATION", text: `${BASE_HEAD}#EXT-X-TARGETDURATION:10\n${BASE_SEGMENT}`, rule: mediaPlaylistTagRules.singleTag },
        { name: "a missing EXT-X-TARGETDURATION", text: `#EXTM3U\n${BASE_SEGMENT}`, rule: extXTargetDurationRules.required },
        { name: "a zero Target Duration", text: `#EXTM3U\n#EXT-X-TARGETDURATION:0\n${BASE_SEGMENT}`, rule: extXTargetDurationRules.format },
        { name: "a segment longer than the Target Duration", text: `${BASE_HEAD}#EXTINF:10.5,\na.ts\n`, rule: extXTargetDurationRules.durationBound },
        { name: "a URI without EXTINF", text: `${BASE_HEAD}a.ts\n`, rule: extinfRules.required },
        { name: "a malformed EXTINF", text: `${BASE_HEAD}#EXTINF:9.009\na.ts\n`, rule: extinfRules.format },
        { name: "a second EXTINF in one segment", text: `${BASE_HEAD}#EXTINF:1,\n#EXTINF:1,\na.ts\n`, rule: extinfRules.singlePerSegment },
        { name: "segment tags with no URI after them", text: `${BASE_HEAD}${BASE_SEGMENT}#EXTINF:1,\n`, rule: mediaSegmentTagRules.uriFollowsTags },
        { name: "a second EXT-X-START", text: `${BASE_HEAD}#EXT-X-START:TIME-OFFSET=1\n#EXT-X-START:TIME-OFFSET=1\n${BASE_SEGMENT}`, rule: extXStartRules.singleTag },
        { name: "an EXT-X-START without TIME-OFFSET", text: `${BASE_HEAD}#EXT-X-START:PRECISE=YES\n${BASE_SEGMENT}`, rule: extXStartRules.format },
        { name: "a malformed attribute-list", text: `${BASE_HEAD}#EXT-X-START:TIME-OFFSET=1,TIME-OFFSET=2\n${BASE_SEGMENT}`, rule: attributeListRules.uniqueAttributeNames },
        { name: "an EXT-X-MEDIA-SEQUENCE after a segment", text: `${BASE_HEAD}${BASE_SEGMENT}#EXT-X-MEDIA-SEQUENCE:1\n`, rule: extXMediaSequenceRules.precedesSegments },
        { name: "an EXT-X-DISCONTINUITY-SEQUENCE after a segment", text: `${BASE_HEAD}${BASE_SEGMENT}#EXT-X-DISCONTINUITY-SEQUENCE:1\n`, rule: extXDiscontinuitySequenceRules.precedesSegments },
        { name: "EXT-X-PART-INF without PART-HOLD-BACK", text: `${BASE_HEAD}#EXT-X-PART-INF:PART-TARGET=1\n${BASE_SEGMENT}`, rule: extXServerControlRules.partHoldBackRequired },
        { name: "a HOLD-BACK under three Target Durations", text: `${BASE_HEAD}#EXT-X-SERVER-CONTROL:HOLD-BACK=29\n${BASE_SEGMENT}`, rule: extXServerControlRules.holdBack },
        { name: "an EXT-X-DISCONTINUITY-SEQUENCE after an EXT-X-DISCONTINUITY", text: `${BASE_HEAD}#EXT-X-DISCONTINUITY\n#EXT-X-DISCONTINUITY-SEQUENCE:1\n${BASE_SEGMENT}`, rule: extXDiscontinuitySequenceRules.precedesDiscontinuity },
        { name: "an offset-less EXT-X-BYTERANGE on the first segment", text: `${BASE_HEAD}#EXT-X-BYTERANGE:100\n${BASE_SEGMENT}`, rule: extXByteRangeRules.offsetFollowsSubRange },
        { name: "a second EXT-X-GAP before one URI", text: `${BASE_HEAD}#EXT-X-GAP\n#EXT-X-GAP\n${BASE_SEGMENT}`, rule: mediaSegmentTagRules.singlePerSegment },
        { name: "an AES-128 key without a URI", text: `${BASE_HEAD}#EXT-X-KEY:METHOD=AES-128\n${BASE_SEGMENT}`, rule: extXKeyRules.uriRequired },
        { name: "a second EXT-X-MAP before one URI", text: `${BASE_HEAD}#EXT-X-MAP:URI="a"\n#EXT-X-MAP:URI="b"\n${BASE_SEGMENT}`, rule: mediaSegmentTagRules.singlePerSegment },
        { name: "an EXT-X-KEY after its Parent Segment's first part", text: `${BASE_HEAD}#EXT-X-PART-INF:PART-TARGET=5\n#EXT-X-SERVER-CONTROL:PART-HOLD-BACK=10\n#EXT-X-PART:DURATION=5,URI="p"\n#EXT-X-KEY:METHOD=NONE\n${BASE_SEGMENT}`, rule: extXPartRules.parentTagsPrecedeParts },
        { name: "a part longer than the Part Target Duration", text: `${BASE_HEAD}#EXT-X-PART-INF:PART-TARGET=5\n#EXT-X-SERVER-CONTROL:PART-HOLD-BACK=10\n#EXT-X-PART:DURATION=6,URI="p"\n${BASE_SEGMENT}`, rule: extXPartRules.durationMax },
        { name: "a Date Range without EXT-X-PROGRAM-DATE-TIME", text: `${BASE_HEAD}#EXT-X-DATERANGE:ID="a",START-DATE="2014-03-05T11:15:00Z"\n${BASE_SEGMENT}`, rule: extXDateRangeRules.programDateTimeRequired },
        { name: "a second EXT-X-SKIP", text: `${BASE_HEAD}#EXT-X-SKIP:SKIPPED-SEGMENTS=1\n#EXT-X-SKIP:SKIPPED-SEGMENTS=1\n${BASE_SEGMENT}`, rule: extXSkipRules.singleTag },
        { name: "an EXT-X-PRELOAD-HINT with EXT-X-ENDLIST", text: `${BASE_HEAD}${BASE_SEGMENT}#EXT-X-PRELOAD-HINT:TYPE=PART,URI="p"\n#EXT-X-ENDLIST\n`, rule: extXPreloadHintRules.notWithEndList },
    ] as const;

    test.each(malformed)("reports $name as malformed", ({ text, rule }) => {
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule }] });
    });
});

describe("HLS.safeParse limits", () => {
    const PLAYLIST = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:1,\na.ts\n#EXTINF:1,\nb.ts\n";
    const LINE_BYTES_MAX = 16;
    const UNIT_COUNT_MAX = 2;

    test("reports a line longer than lineBytesMax", () => {
        const outcome = HLS.safeParse(PLAYLIST, { limits: { lineBytesMax: LINE_BYTES_MAX } });
        expect(outcome).toEqual({ kind: ParseKind.limitExceeded, limit: Limit.lineBytesMax, value: LINE_BYTES_MAX });
    });

    // Each U+1F3B5 is 2 UTF-16 code units and 4 UTF-8 bytes, so the URI is 19 code units and 35 bytes.
    test("counts a line's bytes, not its code units", () => {
        const BYTES_BETWEEN_CODE_UNITS_AND_BYTES = 30;
        const uri = `${"\u{1F3B5}".repeat(8)}.ts`;
        const text = `#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:1,\n${uri}\n`;
        const outcome = HLS.safeParse(text, { limits: { lineBytesMax: BYTES_BETWEEN_CODE_UNITS_AND_BYTES } });
        expect(outcome).toMatchObject({ kind: ParseKind.limitExceeded, limit: Limit.lineBytesMax });
    });

    test("reports more units than unitCountMax, counting the playlist as one", () => {
        const outcome = HLS.safeParse(PLAYLIST, { limits: { unitCountMax: UNIT_COUNT_MAX } });
        expect(outcome).toEqual({ kind: ParseKind.limitExceeded, limit: Limit.unitCountMax, value: UNIT_COUNT_MAX });
    });

    test("parses a playlist exactly at its limits", () => {
        const limits = { lineBytesMax: "#EXT-X-TARGETDURATION:10".length, unitCountMax: UNIT_COUNT_MAX + 1 };
        const outcome = HLS.safeParse(PLAYLIST, { limits });
        expect(outcome.kind).toBe(ParseKind.parsed);
    });

    test.each([0, -1, 1.5, Number.NaN])("rejects the limit %d as a programmer error", (lineBytesMax) => {
        function parseWithLimit() {
            return HLS.safeParse(PLAYLIST, { limits: { lineBytesMax } });
        }
        expect(parseWithLimit).toThrow(AssertionError);
    });
});

describe("HLS.safeParse variable substitution", () => {
    const HEAD = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n";

    test("substitutes a defined variable into a URI line and keeps every definition", () => {
        const text = `${HEAD}#EXT-X-DEFINE:NAME="host",VALUE="example.com"\n#EXT-X-DEFINE:NAME="id",VALUE="7"\n#EXTINF:1,\nhttps://{$host}/{$id}.ts\n`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                "EXT-X-DEFINE": [
                    { NAME: "host", VALUE: "example.com" },
                    { NAME: "id", VALUE: "7" },
                ],
                segments: [{ uri: "https://example.com/7.ts" }],
            },
        });
    });

    test("substitutes into quoted-string attribute values, a definition's VALUE included", () => {
        const text = `${HEAD}#EXT-X-DEFINE:NAME="a",VALUE="x"\n#EXT-X-DEFINE:NAME="b",VALUE="{$a}y"\n#EXTINF:1,\n{$b}.ts\n`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { segments: [{ uri: "xy.ts" }] } });
    });

    test("reads a QUERYPARAM variable from the uri option", () => {
        const text = `${HEAD}#EXT-X-DEFINE:QUERYPARAM="token"\n#EXTINF:1,\na.ts?t={$token}\n`;
        const outcome = HLS.safeParse(text, { uri: new URL("https://example.com/media.m3u8?token=abc") });
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { segments: [{ uri: "a.ts?t=abc" }] } });
    });

    const malformed = [
        { name: "a reference to an undefined variable", text: `${HEAD}#EXTINF:1,\n{$host}.ts\n`, rule: generalClientRules.definedVariableReferences },
        { name: "a reference before its definition", text: `${HEAD}#EXTINF:1,\n{$host}.ts\n#EXT-X-DEFINE:NAME="host",VALUE="a"\n`, rule: generalClientRules.definedVariableReferences },
        { name: "a Variable Name defined twice", text: `${HEAD}#EXT-X-DEFINE:NAME="a",VALUE="x"\n#EXT-X-DEFINE:NAME="a",VALUE="y"\n`, rule: extXDefineRules.uniqueNames },
        { name: "a QUERYPARAM without a uri option", text: `${HEAD}#EXT-X-DEFINE:QUERYPARAM="token"\n`, rule: extXDefineRules.queryParamResolves },
    ] as const;

    test.each(malformed)("reports $name as malformed", ({ text, rule }) => {
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule }] });
    });

    test("reports a substituted line longer than substitutedLineBytesMax", () => {
        const SUBSTITUTED_LINE_BYTES_MAX = 32;
        const value = "x".repeat(SUBSTITUTED_LINE_BYTES_MAX);
        const text = `${HEAD}#EXT-X-DEFINE:NAME="long",VALUE="${value}"\n#EXTINF:1,\n{$long}.ts\n`;
        const limits = { substitutedLineBytesMax: SUBSTITUTED_LINE_BYTES_MAX };
        const outcome = HLS.safeParse(text, { limits });
        expect(outcome).toEqual({
            kind: ParseKind.limitExceeded,
            limit: Limit.substitutedLineBytesMax,
            value: SUBSTITUTED_LINE_BYTES_MAX,
        });
    });
});

function isNotPartInf(line: string) {
    return !line.startsWith("#EXT-X-PART-INF");
}

describe("HLS.safeParse Multivariant Playlists", () => {
    // Section 9.4, Multivariant Playlist.
    const MULTIVARIANT_PLAYLIST = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,AVERAGE-BANDWIDTH=2000000
http://example.com/mid.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=7680000,AVERAGE-BANDWIDTH=6000000
http://example.com/hi.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5"
http://example.com/audio-only.m3u8
`;

    const multivariantPlaylist: MultivariantPlaylist = {
        kind: PlaylistKind.multivariant,
        EXTM3U: true,
        variants: [
            { uri: "http://example.com/low.m3u8", "EXT-X-STREAM-INF": { BANDWIDTH: 1280000n, "AVERAGE-BANDWIDTH": 1000000n }, ignored: [] },
            { uri: "http://example.com/mid.m3u8", "EXT-X-STREAM-INF": { BANDWIDTH: 2560000n, "AVERAGE-BANDWIDTH": 2000000n }, ignored: [] },
            { uri: "http://example.com/hi.m3u8", "EXT-X-STREAM-INF": { BANDWIDTH: 7680000n, "AVERAGE-BANDWIDTH": 6000000n }, ignored: [] },
            { uri: "http://example.com/audio-only.m3u8", "EXT-X-STREAM-INF": { BANDWIDTH: 65000n, CODECS: "mp4a.40.5" }, ignored: [] },
        ],
        ignored: [],
    };

    test("parses section 9.4's Multivariant Playlist", () => {
        const outcome = HLS.safeParse(MULTIVARIANT_PLAYLIST);
        expect(outcome).toEqual({ kind: ParseKind.parsed, playlist: multivariantPlaylist, violations: [] });
    });

    test("keeps section 9.5's I-frame streams on the playlist", () => {
        const text = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000
low/audio-video.m3u8
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=86000,URI="low/iframe.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=2560000
mid/audio-video.m3u8
`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                kind: PlaylistKind.multivariant,
                "EXT-X-I-FRAME-STREAM-INF": [{ BANDWIDTH: 86000n, URI: "low/iframe.m3u8" }],
                variants: [{ uri: "low/audio-video.m3u8" }, { uri: "mid/audio-video.m3u8" }],
            },
        });
    });

    test("ignores a variant whose layout is unrecognized, its URI line with it", () => {
        const streamInf = '#EXT-X-STREAM-INF:BANDWIDTH=1,REQ-VIDEO-LAYOUT="CH-FUTURE"';
        const text = `#EXTM3U\n${streamInf}\nfuture.m3u8\n# kept\n#EXT-X-STREAM-INF:BANDWIDTH=2\nb.m3u8\n`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                variants: [
                    {
                        uri: "b.m3u8",
                        ignored: [
                            { kind: IgnoredKind.ignoredTag, line: streamInf, reason: extXStreamInfIgnoreReason },
                            { kind: IgnoredKind.ignoredUri, line: "future.m3u8", reason: ignoreReasons.followsIgnoredStreamInf },
                            { kind: IgnoredKind.comment, line: "# kept" },
                        ],
                    },
                ],
            },
        });
    });

    const malformed = [
        { name: "a Media Segment tag after a variant", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n#EXTINF:1,\nb.ts\n", rule: mediaSegmentTagRules.notInMultivariant },
        { name: "a Media Playlist tag after a variant", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n#EXT-X-TARGETDURATION:10\n", rule: mediaPlaylistTagRules.notInMultivariant },
        { name: "a Multivariant Playlist tag after a segment", text: "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:1,\na.ts\n#EXT-X-STREAM-INF:BANDWIDTH=1\nb.m3u8\n", rule: multivariantPlaylistTagRules.notInMedia },
        { name: "an EXT-X-STREAM-INF with no URI after it", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\n", rule: extXStreamInfRules.uriRequired },
        { name: "an EXT-X-STREAM-INF without BANDWIDTH", text: "#EXTM3U\n#EXT-X-STREAM-INF:CODECS=\"a\"\na.m3u8\n", rule: extXStreamInfRules.format },
        { name: "a variant URI without EXT-X-STREAM-INF", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\nb.m3u8\n", rule: extXStreamInfRules.precedesUri },
    ] as const;

    test.each(malformed)("reports $name as malformed", ({ text, rule }) => {
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule }] });
    });
});
