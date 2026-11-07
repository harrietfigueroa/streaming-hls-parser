// These tests pin the static Media Playlist path through the default entry:
// section 9.1's example parses to its typed playlist, ignored lines keep their
// position, and each malformed case breaks exactly one rule of a valid base.
import { describe, expect, expectTypeOf, test } from "vitest";

import {
    type DataOf,
    HLS,
    IgnoredKind,
    Limit,
    type MediaPlaylist,
    type MultivariantPlaylist,
    ParseKind,
    type Playlist,
    PlaylistKind,
} from "../src/index.js";
import { defaultTagTables } from "../src/library/tag-table.js";
import {
    extXStreamInfIgnoreReason,
    extXStreamInfRules,
} from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2-ext-x-stream-inf.js";
import { multivariantPlaylistTagRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6-multivariant-playlist-tags.js";
import {
    extXMediaRules,
    MediaType,
    YesNo,
} from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import { renditionGroupRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1.1-rendition-groups.js";
import { alternativeRenditionRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2.1-alternative-renditions.js";
import { extXSessionDataRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.4-ext-x-session-data.js";
import { extXSessionKeyRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.5-ext-x-session-key.js";
import { extXContentSteeringRules } from "../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.6-ext-x-content-steering.js";
import { AssertionError, assertCondition } from "../src/library/assert.js";
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

const simpleMediaPlaylist: DataOf<MediaPlaylist> = {
    kind: PlaylistKind.media,
    EXTM3U: true,
    "EXT-X-TARGETDURATION": 10n,
    "EXT-X-VERSION": 3n,
    "EXT-X-ENDLIST": true,
    segments: [
        {
            uri: "http://media.example.com/first.ts",
            EXTINF: { duration: 9.009 },
            ignored: [],
            keys: [],
            mediaSequenceNumber: 0n,
            discontinuitySequenceNumber: 0n,
        },
        {
            uri: "http://media.example.com/second.ts",
            EXTINF: { duration: 9.009 },
            ignored: [],
            keys: [],
            mediaSequenceNumber: 1n,
            discontinuitySequenceNumber: 0n,
        },
        {
            uri: "http://media.example.com/third.ts",
            EXTINF: { duration: 3.003 },
            ignored: [],
            keys: [],
            mediaSequenceNumber: 2n,
            discontinuitySequenceNumber: 0n,
        },
    ],
    ignored: [],
};

// Section 9.11's excerpt, with the head lines its "..." stands for.
const LOW_LATENCY_LINES = [
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
] as const;

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


    test("keeps the parts after the last URI as the pending Parent Segment", () => {
        const outcome = HLS.safeParse(LOW_LATENCY_LINES.join("\n"));
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
        const withoutPartInf = LOW_LATENCY_LINES.filter(isNotPartInf);
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

    const MULTIVARIANT_URI = new URL("https://example.com/main.m3u8?token=abc");
    const MULTIVARIANT_WITH_DEFINITIONS = '#EXTM3U\n#EXT-X-DEFINE:NAME="host",VALUE="example.com"\n#EXT-X-DEFINE:QUERYPARAM="token"\n#EXT-X-STREAM-INF:BANDWIDTH=1\nhttps://{$host}/a.m3u8\n';

    function parseMultivariant(text: string) {
        const outcome = HLS.safeParse(text, { uri: MULTIVARIANT_URI });
        assertCondition(outcome.kind === ParseKind.parsed, `The Multivariant Playlist parsed as ${outcome.kind}.`);
        const playlist = outcome.playlist;
        assertCondition(playlist.kind === PlaylistKind.multivariant, `The playlist parsed as ${playlist.kind}.`);
        return playlist;
    }

    test("keeps a Multivariant Playlist's resolved variables, QUERYPARAM values included", () => {
        const playlist = parseMultivariant(MULTIVARIANT_WITH_DEFINITIONS);
        expect(playlist.variables).toEqual(new Map([["host", "example.com"], ["token", "abc"]]));
    });

    test("substitutes an IMPORT from the multivariant option", () => {
        const multivariant = parseMultivariant(MULTIVARIANT_WITH_DEFINITIONS);
        const text = `${HEAD}#EXT-X-DEFINE:IMPORT="host"\n#EXT-X-DEFINE:IMPORT="token"\n#EXTINF:1,\nhttps://{$host}/a.ts?t={$token}\n`;
        const outcome = HLS.safeParse(text, { multivariant });
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { segments: [{ uri: "https://example.com/a.ts?t=abc" }] } });
    });

    test("reports an IMPORT the multivariant option does not declare", () => {
        const multivariant = parseMultivariant(MULTIVARIANT_WITH_DEFINITIONS);
        const outcome = HLS.safeParse(`${HEAD}#EXT-X-DEFINE:IMPORT="cdn"\n#EXTINF:1,\na.ts\n`, { multivariant });
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule: extXDefineRules.importResolves }] });
    });

    test("reports an IMPORT in a Multivariant Playlist", () => {
        const multivariant = parseMultivariant(MULTIVARIANT_WITH_DEFINITIONS);
        const text = '#EXTM3U\n#EXT-X-DEFINE:IMPORT="host"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n';
        const outcome = HLS.safeParse(text, { multivariant });
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule: extXDefineRules.importNotInMultivariant }] });
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

    const multivariantPlaylist: DataOf<MultivariantPlaylist> = {
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

    // Section 9.6, Multivariant Playlist with Alternative Audio, with its continued lines joined and CODECS written out.
    const ALTERNATIVE_AUDIO_PLAYLIST = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="main/english-audio.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="Deutsch",DEFAULT=NO,AUTOSELECT=YES,LANGUAGE="de",URI="main/german-audio.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="Commentary",DEFAULT=NO,AUTOSELECT=NO,LANGUAGE="en",URI="commentary/audio-only.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="avc1.4d401e,mp4a.40.2",AUDIO="aac"
low/video-only.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5",AUDIO="aac"
main/english-audio.m3u8
`;

    test("keeps section 9.6's alternative audio Renditions on the playlist", () => {
        const outcome = HLS.safeParse(ALTERNATIVE_AUDIO_PLAYLIST);
        const english = { TYPE: MediaType.audio, "GROUP-ID": "aac", NAME: "English", DEFAULT: YesNo.yes, AUTOSELECT: YesNo.yes, LANGUAGE: "en", URI: "main/english-audio.m3u8" };
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: { kind: PlaylistKind.multivariant, "EXT-X-MEDIA": [english, { NAME: "Deutsch" }, { NAME: "Commentary" }] },
            violations: [],
        });
    });

    test("parses section 9.7's matching video Groups", () => {
        const groups = ["low", "mid", "hi"];
        const lines = ["#EXTM3U"];
        for (const [groupIndex, groupId] of groups.entries()) {
            lines.push(`#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="${groupId}",NAME="Main",DEFAULT=YES,URI="${groupId}/main/audio-video.m3u8"`);
            lines.push(`#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="${groupId}",NAME="Centerfield",DEFAULT=NO,URI="${groupId}/centerfield/audio-video.m3u8"`);
            lines.push(`#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="${groupId}",NAME="Dugout",DEFAULT=NO,URI="${groupId}/dugout/audio-video.m3u8"`);
            lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${groupIndex + 1}280000,CODECS="avc1.4d401e,mp4a.40.2",VIDEO="${groupId}"`);
            lines.push(`${groupId}/main/audio-video.m3u8`);
        }
        const outcome = HLS.safeParse(`${lines.join("\n")}\n`);
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, violations: [] });
    });

    test("ignores an EXT-X-MEDIA whose TYPE is unrecognized, keeping it on the next variant", () => {
        const media = '#EXT-X-MEDIA:TYPE=HAPTICS,GROUP-ID="h",NAME="Rumble"';
        const outcome = HLS.safeParse(`#EXTM3U\n${media}\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n`);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: { variants: [{ ignored: [{ kind: IgnoredKind.ignoredTag, line: media, reason: ignoreReasons.unrecognizedEnumeratedValue }] }] },
        });
    });

    test("keeps section 9.8's session data on the playlist", () => {
        const text = `#EXTM3U
#EXT-X-SESSION-DATA:DATA-ID="com.example.lyrics",URI="lyrics.json"
#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="en",VALUE="This is an example"
#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="es",VALUE="Este es un ejemplo"
#EXT-X-STREAM-INF:BANDWIDTH=1
a.m3u8
`;
        const sessionData = [
            { "DATA-ID": "com.example.lyrics", URI: "lyrics.json" },
            { "DATA-ID": "com.example.title", LANGUAGE: "en", VALUE: "This is an example" },
            { "DATA-ID": "com.example.title", LANGUAGE: "es", VALUE: "Este es un ejemplo" },
        ];
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { "EXT-X-SESSION-DATA": sessionData }, violations: [] });
    });

    test("keeps session keys and the content steering tag on the playlist", () => {
        const text = `#EXTM3U
#EXT-X-CONTENT-STEERING:SERVER-URI="/steering?video=00012",PATHWAY-ID="CDN-A"
#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="skd://key",KEYFORMAT="com.apple.streamingkeydelivery"
#EXT-X-STREAM-INF:BANDWIDTH=1280000,PATHWAY-ID="CDN-A"
128/video.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1280000,PATHWAY-ID="CDN-B"
https://backup.example.com/128/video.m3u8
`;
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({
            kind: ParseKind.parsed,
            playlist: {
                "EXT-X-CONTENT-STEERING": { "SERVER-URI": "/steering?video=00012", "PATHWAY-ID": "CDN-A" },
                "EXT-X-SESSION-KEY": [{ METHOD: KeyMethod.sampleAes, URI: "skd://key", KEYFORMAT: "com.apple.streamingkeydelivery" }],
            },
            violations: [],
        });
    });

    const malformed = [
        { name: "a Media Segment tag after a variant", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n#EXTINF:1,\nb.ts\n", rule: mediaSegmentTagRules.notInMultivariant },
        { name: "a Media Playlist tag after a variant", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n#EXT-X-TARGETDURATION:10\n", rule: mediaPlaylistTagRules.notInMultivariant },
        { name: "a Multivariant Playlist tag after a segment", text: "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:1,\na.ts\n#EXT-X-STREAM-INF:BANDWIDTH=1\nb.m3u8\n", rule: multivariantPlaylistTagRules.notInMedia },
        { name: "an EXT-X-STREAM-INF with no URI after it", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\n", rule: extXStreamInfRules.uriRequired },
        { name: "an EXT-X-STREAM-INF without BANDWIDTH", text: "#EXTM3U\n#EXT-X-STREAM-INF:CODECS=\"a\"\na.m3u8\n", rule: extXStreamInfRules.format },
        { name: "a variant URI without EXT-X-STREAM-INF", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\nb.m3u8\n", rule: extXStreamInfRules.precedesUri },
        { name: "an EXT-X-MEDIA in a Media Playlist", text: '#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a",NAME="A"\n#EXTINF:1,\na.ts\n', rule: multivariantPlaylistTagRules.notInMedia },
        { name: "an EXT-X-MEDIA without NAME", text: '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n', rule: extXMediaRules.format },
        {
            name: "a CLOSED-CAPTIONS Rendition with a URI",
            text: '#EXTM3U\n#EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="cc",NAME="A",INSTREAM-ID="CC1",URI="cc.m3u8"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n',
            rule: extXMediaRules.closedCaptionsUri,
        },
        { name: "a SUBTITLES Rendition without a URI", text: '#EXTM3U\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="s",NAME="A"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n', rule: alternativeRenditionRules.subtitlesUri },
        {
            name: "two Renditions of one Group with one NAME",
            text: '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a",NAME="A"\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a",NAME="A"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n',
            rule: renditionGroupRules.distinctNames,
        },
        { name: "an AUDIO naming no Group", text: '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1,AUDIO="aac"\na.m3u8\n', rule: extXStreamInfRules.groupReference },
        { name: "an EXT-X-SESSION-DATA in a Media Playlist", text: '#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-SESSION-DATA:DATA-ID="a",VALUE="b"\n#EXTINF:1,\na.ts\n', rule: multivariantPlaylistTagRules.notInMedia },
        { name: "an EXT-X-SESSION-DATA with neither VALUE nor URI", text: '#EXTM3U\n#EXT-X-SESSION-DATA:DATA-ID="a"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n', rule: extXSessionDataRules.valueOrUri },
        { name: "an EXT-X-SESSION-KEY with METHOD=NONE", text: "#EXTM3U\n#EXT-X-SESSION-KEY:METHOD=NONE\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n", rule: extXSessionKeyRules.methodNotNone },
        {
            name: "two EXT-X-CONTENT-STEERING tags",
            text: '#EXTM3U\n#EXT-X-CONTENT-STEERING:SERVER-URI="a"\n#EXT-X-CONTENT-STEERING:SERVER-URI="b"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n',
            rule: extXContentSteeringRules.singleTag,
        },
        {
            name: "a steering PATHWAY-ID no variant is on",
            text: '#EXTM3U\n#EXT-X-CONTENT-STEERING:SERVER-URI="a",PATHWAY-ID="CDN-A"\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n',
            rule: extXContentSteeringRules.pathwayOfVariant,
        },
    ] as const;

    test.each(malformed)("reports $name as malformed", ({ text, rule }) => {
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule }] });
    });
});

// HLS.parse returns safeParse's playlist and throws for every other outcome, as JSON.parse throws.
describe("HLS.parse", () => {
    const MISSING_TARGET_DURATION = "#EXTM3U\n#EXTINF:1,\na.ts\n";

    test("returns the playlist safeParse parses", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST);
        assertCondition(outcome.kind === ParseKind.parsed, `Section 9.1's playlist parsed as ${outcome.kind}.`);
        expect(HLS.parse(SIMPLE_MEDIA_PLAYLIST)).toEqual(outcome.playlist);
    });

    test("passes its options to the parse", () => {
        const text = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-DEFINE:QUERYPARAM=\"token\"\n#EXTINF:1,\na.ts?t={$token}\n";
        const playlist = HLS.parse(text, { uri: new URL("https://example.com/media.m3u8?token=abc") });
        expect(playlist).toMatchObject({ segments: [{ uri: "a.ts?t=abc" }] });
    });

    test("throws a SyntaxError whose cause is the malformed outcome's issues", () => {
        const outcome = HLS.safeParse(MISSING_TARGET_DURATION);
        assertCondition(outcome.kind === ParseKind.malformed, `The playlist parsed as ${outcome.kind}.`);
        function parseMalformed() {
            return HLS.parse(MISSING_TARGET_DURATION);
        }
        expect(parseMalformed).toThrow(expect.objectContaining({ name: "SyntaxError", cause: outcome.issues }));
    });

    test("throws a RangeError whose cause is the exceeded limit and its value", () => {
        const unitCountMax = 1;
        function parseOverLimit() {
            return HLS.parse(SIMPLE_MEDIA_PLAYLIST, { limits: { unitCountMax } });
        }
        expect(parseOverLimit).toThrow(expect.objectContaining({ name: "RangeError", cause: { limit: Limit.unitCountMax, value: unitCountMax } }));
    });
});

// The kind option settles the playlist's kind before the first line, so a tag of the other kind
// breaks that kind's out-of-kind rule, and the parse's type narrows to the asserted kind's playlist.
describe("HLS.safeParse and HLS.parse with a kind", () => {
    const MULTIVARIANT_PLAYLIST = "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\na.m3u8\n";

    test("parses a playlist of the asserted kind", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST, { kind: PlaylistKind.media });
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { kind: PlaylistKind.media } });
    });

    test("reports a Multivariant Playlist tag where a Media Playlist was asserted", () => {
        const outcome = HLS.safeParse(MULTIVARIANT_PLAYLIST, { kind: PlaylistKind.media });
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule: multivariantPlaylistTagRules.notInMedia }] });
    });

    test("reports a Media Playlist tag where a Multivariant Playlist was asserted", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST, { kind: PlaylistKind.multivariant });
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule: mediaPlaylistTagRules.notInMultivariant }] });
    });

    test("settles a playlist with no kind's tag as the asserted kind", () => {
        const outcome = HLS.safeParse("#EXTM3U\n", { kind: PlaylistKind.media });
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule: extXTargetDurationRules.required }] });
    });

    test("parse throws a SyntaxError for a playlist of the other kind", () => {
        function parseOtherKind() {
            return HLS.parse(MULTIVARIANT_PLAYLIST, { kind: PlaylistKind.media });
        }
        expect(parseOtherKind).toThrow(SyntaxError);
    });

    test("narrows the parse's type to the kind option's playlist", () => {
        expectTypeOf(HLS.parse(SIMPLE_MEDIA_PLAYLIST, { kind: PlaylistKind.media })).toEqualTypeOf<MediaPlaylist>();
        expectTypeOf(HLS.parse(MULTIVARIANT_PLAYLIST, { kind: PlaylistKind.multivariant })).toEqualTypeOf<MultivariantPlaylist>();
        expectTypeOf(HLS.parse(SIMPLE_MEDIA_PLAYLIST)).toEqualTypeOf<Playlist>();
    });

    test("narrows safeParse's parsed playlist to the kind option's playlist", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST, { kind: PlaylistKind.media });
        assertCondition(outcome.kind === ParseKind.parsed, `Section 9.1's playlist parsed as ${outcome.kind}.`);
        expectTypeOf(outcome.playlist).toEqualTypeOf<MediaPlaylist>();
    });

    test("takes a playlist type argument only with the matching kind option", () => {
        expectTypeOf(HLS.parse<MediaPlaylist>(SIMPLE_MEDIA_PLAYLIST, { kind: PlaylistKind.media })).toEqualTypeOf<MediaPlaylist>();
        function parseUnchecked() {
            // @ts-expect-error A type argument without the kind option that checks it would be an unchecked cast.
            return HLS.parse<MediaPlaylist>(SIMPLE_MEDIA_PLAYLIST);
        }
        function parseMismatched() {
            // @ts-expect-error The kind option has to name the type argument's kind.
            return HLS.parse<MediaPlaylist>(MULTIVARIANT_PLAYLIST, { kind: PlaylistKind.multivariant });
        }
        // At run time the kind option alone decides, which is why the type argument must match it.
        expect(parseUnchecked()).toMatchObject({ kind: PlaylistKind.media });
        expect(parseMismatched()).toMatchObject({ kind: PlaylistKind.multivariant });
    });
});

// Each segment carries the carry-forward tags that apply to it as resolved fields, computed from the
// tags written before it, so a caller reading one segment needs no state from the segments before it.
describe("HLS.safeParse resolved fields", () => {
    function parseMedia(lines: readonly string[]) {
        const text = ["#EXTM3U", "#EXT-X-TARGETDURATION:10", ...lines, ""].join("\n");
        const outcome = HLS.safeParse(text);
        assertCondition(outcome.kind === ParseKind.parsed, `The Media Playlist parsed as ${outcome.kind}.`);
        const playlist = outcome.playlist;
        assertCondition(playlist.kind === PlaylistKind.media, `The playlist parsed as ${playlist.kind}.`);
        return playlist;
    }

    test("numbers segments from 0 without an EXT-X-MEDIA-SEQUENCE", () => {
        const playlist = parseMedia(["#EXTINF:1,", "a.ts", "#EXTINF:1,", "b.ts"]);
        expect(playlist.segments).toMatchObject([{ mediaSequenceNumber: 0n }, { mediaSequenceNumber: 1n }]);
    });

    test("numbers segments from the EXT-X-MEDIA-SEQUENCE", () => {
        const playlist = parseMedia(["#EXT-X-MEDIA-SEQUENCE:7", "#EXTINF:1,", "a.ts", "#EXTINF:1,", "b.ts"]);
        expect(playlist.segments).toMatchObject([{ mediaSequenceNumber: 7n }, { mediaSequenceNumber: 8n }]);
    });

    test("counts discontinuities up from the EXT-X-DISCONTINUITY-SEQUENCE, at each segment with EXT-X-DISCONTINUITY", () => {
        const lines = ["#EXT-X-DISCONTINUITY-SEQUENCE:3", "#EXTINF:1,", "a.ts", "#EXT-X-DISCONTINUITY", "#EXTINF:1,", "b.ts", "#EXTINF:1,", "c.ts"];
        const playlist = parseMedia(lines);
        const numbers = [{ discontinuitySequenceNumber: 3n }, { discontinuitySequenceNumber: 4n }, { discontinuitySequenceNumber: 4n }];
        expect(playlist.segments).toMatchObject(numbers);
    });

    test("applies each EXT-X-MAP to every segment until the next one, as the written tag", () => {
        const lines = ["#EXTINF:1,", "a.ts", '#EXT-X-MAP:URI="one.mp4"', "#EXTINF:1,", "b.ts", "#EXTINF:1,", "c.ts", '#EXT-X-MAP:URI="two.mp4"', "#EXTINF:1,", "d.ts"];
        const [first, second, third, fourth] = parseMedia(lines).segments;
        expect(first).not.toHaveProperty("map");
        expect(second?.map).toBe(second?.["EXT-X-MAP"]);
        expect(third?.map).toBe(second?.["EXT-X-MAP"]);
        expect(fourth?.map).toEqual({ URI: "two.mp4" });
    });

    test("applies each EXT-X-BITRATE to the later segments without an EXT-X-BYTERANGE", () => {
        const lines = ["#EXTINF:1,", "a.ts", "#EXT-X-BITRATE:900", "#EXTINF:1,", "b.ts", "#EXT-X-BYTERANGE:10@0", "#EXTINF:1,", "c.ts", "#EXTINF:1,", "d.ts"];
        const [first, second, third, fourth] = parseMedia(lines).segments;
        expect(first).not.toHaveProperty("bitrate");
        expect(second?.bitrate).toBe(900n);
        expect(third).not.toHaveProperty("bitrate");
        expect(fourth?.bitrate).toBe(900n);
    });

    test("resolves a missing byte range offset to the byte after the previous sub-range", () => {
        const lines = ["#EXT-X-BYTERANGE:100@50", "#EXTINF:1,", "a.ts", "#EXT-X-BYTERANGE:20", "#EXTINF:1,", "a.ts", "#EXTINF:1,", "b.ts"];
        const [first, second, third] = parseMedia(lines).segments;
        expect(first?.byteRange).toEqual({ length: 100n, offset: 50n });
        expect(second?.byteRange).toEqual({ length: 20n, offset: 150n });
        expect(third).not.toHaveProperty("byteRange");
    });

    const KEY_A = '#EXT-X-KEY:METHOD=AES-128,URI="a.key"';
    const KEY_B = '#EXT-X-KEY:METHOD=AES-128,URI="b.key"';
    const KEY_STREAMING = '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://c",KEYFORMAT="com.apple.streamingkeydelivery"';
    const KEY_NONE = "#EXT-X-KEY:METHOD=NONE";

    const keyCases = [
        { name: "no key before the first EXT-X-KEY", lines: [], uris: [] },
        { name: "a key on the segments after it", lines: [KEY_A, "#EXTINF:1,", "x.ts"], uris: ["a.key"] },
        { name: "a later key of the same KEYFORMAT in place of the earlier", lines: [KEY_A, "#EXTINF:1,", "x.ts", KEY_B], uris: ["b.key"] },
        { name: "keys of different KEYFORMATs together", lines: [KEY_A, KEY_STREAMING], uris: ["a.key", "skd://c"] },
        { name: "no key after a METHOD of NONE", lines: [KEY_A, KEY_STREAMING, "#EXTINF:1,", "x.ts", KEY_NONE], uris: [] },
    ] as const;

    test.each(keyCases)("applies $name", ({ lines, uris }) => {
        const playlist = parseMedia([...lines, "#EXTINF:1,", "last.ts"]);
        const last = playlist.segments.at(-1);
        assertCondition(last !== undefined, "The playlist has no segment.");
        const keyUris = Array.from(last.keys, uriOfKey);
        expect(keyUris).toEqual(uris);
    });

    test("applies the written EXT-X-KEY object itself", () => {
        const [first, second] = parseMedia([KEY_A, "#EXTINF:1,", "a.ts", "#EXTINF:1,", "b.ts"]).segments;
        const written = first?.["EXT-X-KEY"]?.[0];
        expect(written).toBeDefined();
        expect(second?.keys[0]).toBe(written);
    });

    test("resolves the pending Parent Segment's fields too", () => {
        const lines = [
            "#EXT-X-PART-INF:PART-TARGET=1",
            "#EXT-X-SERVER-CONTROL:PART-HOLD-BACK=3",
            "#EXT-X-MEDIA-SEQUENCE:4",
            '#EXT-X-MAP:URI="init.mp4"',
            "#EXTINF:1,",
            "a.ts",
            '#EXT-X-PART:DURATION=1,URI="b.0.mp4"',
        ];
        const playlist = parseMedia(lines);
        expect(playlist.pendingSegment).toMatchObject({ mediaSequenceNumber: 5n, discontinuitySequenceNumber: 0n, map: { URI: "init.mp4" }, keys: [] });
    });

    test("freezes the resolved fields", () => {
        const [, second] = parseMedia(["#EXT-X-BYTERANGE:1@0", "#EXTINF:1,", "a.ts", "#EXT-X-BYTERANGE:1", "#EXTINF:1,", "a.ts"]).segments;
        assertCondition(second !== undefined, "The playlist has no second segment.");
        expect(second.byteRange).toBeDefined();
        expect(Object.isFrozen(second.keys)).toBe(true);
        expect(Object.isFrozen(second.byteRange)).toBe(true);
    });
});

function uriOfKey(key: { readonly URI?: string | undefined }) {
    return key.URI;
}

// A reviver passed second runs over the parsed playlist as JSON.parse runs one, and options then go third.
describe("HLS.safeParse and HLS.parse with a reviver", () => {
    function bigIntsToStrings(this: unknown, _key: string, value: unknown) {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    }

    test("safeParse returns the revived playlist", () => {
        const outcome = HLS.safeParse(SIMPLE_MEDIA_PLAYLIST, bigIntsToStrings);
        const segments = [{ mediaSequenceNumber: "0" }, { mediaSequenceNumber: "1" }, { mediaSequenceNumber: "2" }];
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { "EXT-X-TARGETDURATION": "10", segments } });
    });

    test("safeParse reads the options after a reviver", () => {
        const text = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-DEFINE:QUERYPARAM=\"token\"\n#EXTINF:1,\na.ts?t={$token}\n";
        const outcome = HLS.safeParse(text, bigIntsToStrings, { uri: new URL("https://example.com/media.m3u8?token=abc") });
        expect(outcome).toMatchObject({ kind: ParseKind.parsed, playlist: { segments: [{ uri: "a.ts?t=abc" }] } });
    });

    test("safeParse leaves a malformed outcome unrevived", () => {
        const text = "#EXTM3U\n#EXTINF:1,\na.ts\n";
        const expected = HLS.safeParse(text);
        expect(HLS.safeParse(text, bigIntsToStrings)).toEqual(expected);
    });

    test("parse returns the revived playlist", () => {
        expect(HLS.parse(SIMPLE_MEDIA_PLAYLIST, bigIntsToStrings)).toMatchObject({ "EXT-X-VERSION": "3" });
    });
});

// Parsed playlists and units carry toHLS, toString, and toJSON on a shared prototype, and playlists toStream:
// toHLS returns the text exactly as written, and joining the chunks toStream yields reproduces it.
describe("parsed objects' methods", () => {
    const CRLF_PLAYLIST = SIMPLE_MEDIA_PLAYLIST.replaceAll("\n", "\r\n");
    const COMMENTED_PLAYLIST = "#EXTM3U\n# head\n#EXT-X-TARGETDURATION:10\n# lead\n#EXTINF:1,\na.ts\n#EXT-X-ENDLIST";
    const DROPPED_VARIANT_PLAYLIST = "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1,REQ-FUTURE=1\nfuture.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2\nb.m3u8\n";

    const texts = [
        { name: "section 9.1's playlist", text: SIMPLE_MEDIA_PLAYLIST },
        { name: "a playlist of CR LF lines", text: CRLF_PLAYLIST },
        { name: "a playlist with comments and no final line feed", text: COMMENTED_PLAYLIST },
        { name: "the Low-Latency playlist with its pending segment", text: LOW_LATENCY_LINES.join("\n") },
        { name: "a Multivariant Playlist with an ignored variant", text: DROPPED_VARIANT_PLAYLIST },
    ] as const;

    function parseText(text: string) {
        const outcome = HLS.safeParse(text);
        assertCondition(outcome.kind === ParseKind.parsed, `The playlist parsed as ${outcome.kind}.`);
        return outcome.playlist;
    }

    function parseMediaText(text: string) {
        const playlist = parseText(text);
        assertCondition(playlist.kind === PlaylistKind.media, `The playlist parsed as ${playlist.kind}.`);
        return playlist;
    }

    test.each(texts)("toHLS returns $name exactly", ({ text }) => {
        expect(parseText(text).toHLS()).toBe(text);
    });

    test.each(texts)("toString returns $name exactly", ({ text }) => {
        const playlist = parseText(text);
        expect(String(playlist)).toBe(text);
    });

    test.each(texts)("toStream yields $name as UTF-8 chunks that join to the text", async ({ text }) => {
        const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
        let joined = "";
        for await (const chunk of parseText(text).toStream()) {
            joined += decoder.decode(chunk, { stream: true });
        }
        expect(joined).toBe(text);
    });

    test("a segment's toHLS returns its own lines", () => {
        const [first, second] = parseMediaText(SIMPLE_MEDIA_PLAYLIST).segments;
        expect(first?.toHLS()).toBe("#EXTINF:9.009,\nhttp://media.example.com/first.ts\n");
        expect(second?.toHLS()).toBe("#EXTINF:9.009,\nhttp://media.example.com/second.ts\n");
    });

    test("a segment's toHLS includes the comments after the last playlist tag before it", () => {
        const [segment] = parseMediaText(COMMENTED_PLAYLIST).segments;
        expect(segment?.toHLS()).toBe("# lead\n#EXTINF:1,\na.ts\n");
    });

    test("a segment's toHLS includes a playlist tag written among its tags", () => {
        const text = "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:1,\n#EXT-X-ENDLIST\na.ts\n";
        const [segment] = parseMediaText(text).segments;
        expect(segment?.toHLS()).toBe("#EXTINF:1,\n#EXT-X-ENDLIST\na.ts\n");
    });

    const ignoredBeforeSegment = [
        { name: "for its attribute-list syntax", tag: '#EXT-X-DATERANGE:ID="ad",ID="ad"' },
        { name: "for an unrecognized REQ- attribute", tag: "#EXT-X-START:TIME-OFFSET=1,REQ-FUTURE=1" },
    ] as const;

    // An ignored tag is among the next segment's ignored lines, so its line is in that segment's text too.
    test.each(ignoredBeforeSegment)("a segment's toHLS includes a playlist tag ignored before it $name", ({ tag }) => {
        const text = `#EXTM3U\n#EXT-X-TARGETDURATION:10\n${tag}\n#EXTINF:1,\na.ts\n`;
        const playlist = parseMediaText(text);
        const [segment] = playlist.segments;
        expect(segment?.toHLS()).toBe(`${tag}\n#EXTINF:1,\na.ts\n`);
        expect(playlist.toHLS()).toBe(text);
    });

    test("a variant's toHLS includes the lines of an ignored variant before it", () => {
        const playlist = parseText(DROPPED_VARIANT_PLAYLIST);
        assertCondition(playlist.kind === PlaylistKind.multivariant, `The playlist parsed as ${playlist.kind}.`);
        const [variant] = playlist.variants;
        expect(variant?.toHLS()).toBe("#EXT-X-STREAM-INF:BANDWIDTH=1,REQ-FUTURE=1\nfuture.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2\nb.m3u8\n");
    });

    test("the pending segment's toHLS returns its lines", () => {
        const pending = parseMediaText(LOW_LATENCY_LINES.join("\n")).pendingSegment;
        expect(pending?.toHLS()).toBe('#EXT-X-PART:DURATION=2.00004,INDEPENDENT=YES,URI="midRoll274.0.mp4"\n');
    });

    test("toJSON writes each bigint as its decimal string", () => {
        const playlist = parseMediaText(SIMPLE_MEDIA_PLAYLIST);
        const json = playlist.toJSON();
        expect(json["EXT-X-TARGETDURATION"]).toBe("10");
        expect(json.segments[2]?.mediaSequenceNumber).toBe("2");
    });

    test("JSON.stringify writes the playlist's data", () => {
        const playlist = parseMediaText(SIMPLE_MEDIA_PLAYLIST);
        const parsed: unknown = JSON.parse(JSON.stringify(playlist));
        expect(parsed).toMatchObject({ "EXT-X-TARGETDURATION": "10", segments: [{ uri: "http://media.example.com/first.ts" }, {}, {}] });
    });

    test("keeps the methods off the objects' own keys", () => {
        const playlist = parseMediaText(SIMPLE_MEDIA_PLAYLIST);
        const [segment] = playlist.segments;
        expect(Object.keys(playlist)).not.toContain("toHLS");
        expect(Object.keys({ ...segment })).toEqual(["EXTINF", "uri", "ignored", "keys", "mediaSequenceNumber", "discontinuitySequenceNumber"]);
    });

    test("freezes the shared prototypes", () => {
        const playlist = parseMediaText(SIMPLE_MEDIA_PLAYLIST);
        const [segment] = playlist.segments;
        const playlistPrototype: unknown = Object.getPrototypeOf(playlist);
        const segmentPrototype: unknown = Object.getPrototypeOf(segment);
        expect(Object.isFrozen(playlistPrototype)).toBe(true);
        expect(Object.isFrozen(segmentPrototype)).toBe(true);
    });
});

// HLS.stringify writes a playlist or a unit from its data alone in the canonical form: parsing what it
// writes gives back the same data, for playlists that together carry every tag the library recognizes.
describe("HLS.stringify", () => {
    const MEDIA_EVERY_TAG = [
        "#EXTM3U",
        "#EXT-X-VERSION:10",
        "#EXT-X-INDEPENDENT-SEGMENTS",
        "#EXT-X-START:TIME-OFFSET=-3.5,PRECISE=YES",
        '#EXT-X-DEFINE:NAME="host",VALUE="example.com"',
        "#EXT-X-TARGETDURATION:4",
        "#EXT-X-MEDIA-SEQUENCE:270",
        "#EXT-X-DISCONTINUITY-SEQUENCE:2",
        "#EXT-X-PLAYLIST-TYPE:EVENT",
        "#EXT-X-PART-INF:PART-TARGET=1.002",
        "#EXT-X-SERVER-CONTROL:CAN-SKIP-UNTIL=24,CAN-SKIP-DATERANGES=YES,HOLD-BACK=12,PART-HOLD-BACK=3.012,CAN-BLOCK-RELOAD=YES",
        '#EXT-X-SKIP:SKIPPED-SEGMENTS=3,RECENTLY-REMOVED-DATERANGES="old"',
        '#EXT-X-DATERANGE:ID="ad",CLASS="com.example.ad",START-DATE="2026-01-01T00:00:00Z",CUE="PRE,ONCE",DURATION=30,PLANNED-DURATION=30,SCTE35-OUT=0xFC30,X-AD-ID="XYZ",X-COUNT=2.5,X-RAW=0xAB',
        "# a comment",
        "#EXT-X-FUTURE:1",
        '#EXT-X-KEY:METHOD=AES-128,URI="https://{$host}/key",IV=0x0123456789ABCDEF0123456789ABCDEF,KEYFORMAT="identity",KEYFORMATVERSIONS="1",FUTURE=2',
        '#EXT-X-MAP:URI="init.mp4",BYTERANGE="720@0"',
        "#EXT-X-PROGRAM-DATE-TIME:2026-01-01T00:00:00.000Z",
        "#EXT-X-BITRATE:1500",
        '#EXT-X-PART:DURATION=1.002,URI="p0.mp4",INDEPENDENT=YES,BYTERANGE="100@0"',
        '#EXT-X-PART:DURATION=1.002,URI="p0.mp4",BYTERANGE="100@100"',
        "#EXTINF:4.004,title",
        "a.mp4",
        "#EXT-X-DISCONTINUITY",
        "#EXT-X-GAP",
        "#EXT-X-BYTERANGE:1000@0",
        "#EXTINF:4,",
        "b.mp4",
        "#EXT-X-BYTERANGE:1000",
        "#EXTINF:4,",
        "b.mp4",
        '#EXT-X-PART:DURATION=1,URI="c.0.mp4"',
        '#EXT-X-PRELOAD-HINT:TYPE=PART,URI="c.1.mp4",BYTERANGE-START=0,BYTERANGE-LENGTH=100',
        '#EXT-X-RENDITION-REPORT:URI="other.m3u8",LAST-MSN=273,LAST-PART=0',
        "",
    ].join("\n");

    const MEDIA_I_FRAMES = '#EXTM3U\n#EXT-X-TARGETDURATION:4\n#EXT-X-I-FRAMES-ONLY\n#EXT-X-MAP:URI="i.mp4"\n#EXT-X-BYTERANGE:100@0\n#EXTINF:4,\ni.mp4\n#EXT-X-ENDLIST\n';

    const MULTIVARIANT_EVERY_TAG = [
        "#EXTM3U",
        "#EXT-X-VERSION:13",
        "#EXT-X-INDEPENDENT-SEGMENTS",
        "#EXT-X-START:TIME-OFFSET=10",
        '#EXT-X-DEFINE:NAME="cdn",VALUE="https://cdn.example.com"',
        '#EXT-X-CONTENT-STEERING:SERVER-URI="https://steer.example.com",PATHWAY-ID="CDN-A"',
        '#EXT-X-SESSION-DATA:DATA-ID="com.example.title",VALUE="Title",LANGUAGE="en"',
        '#EXT-X-SESSION-DATA:DATA-ID="com.example.info",URI="info.json",FORMAT=JSON',
        '#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,URI="skd://key",KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1"',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="English",LANGUAGE="en",ASSOC-LANGUAGE="en-US",DEFAULT=YES,AUTOSELECT=YES,CHANNELS="6/JOC/BINAURAL",CHARACTERISTICS="public.accessibility.describes-video",BIT-DEPTH=16,SAMPLE-RATE=48000,STABLE-RENDITION-ID="en",URI="{$cdn}/en.m3u8"',
        '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="sub",NAME="English",LANGUAGE="en",DEFAULT=NO,AUTOSELECT=YES,FORCED=NO,URI="subs.m3u8"',
        '#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=86000,URI="iframe.m3u8",CODECS="avc1.4d001f",RESOLUTION=640x360,VIDEO-RANGE=SDR,HDCP-LEVEL=NONE',
        "# a comment",
        '#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,SCORE=1.5,CODECS="avc1.4d001f,mp4a.40.2",SUPPLEMENTAL-CODECS="dvh1.08.01/db1p",RESOLUTION=1280x720,FRAME-RATE=29.97,HDCP-LEVEL=TYPE-0,ALLOWED-CPC="com.example:SW",VIDEO-RANGE=PQ,REQ-VIDEO-LAYOUT="CH-STEREO,CH-MONO",STABLE-VARIANT-ID="hd",AUDIO="aud",SUBTITLES="sub",CLOSED-CAPTIONS=NONE,PATHWAY-ID="CDN-A"',
        "hd.m3u8",
        '#EXT-X-STREAM-INF:BANDWIDTH=1,REQ-FUTURE=1',
        "dropped.m3u8",
        '#EXT-X-STREAM-INF:BANDWIDTH=320000,AUDIO="aud",CLOSED-CAPTIONS=NONE,PATHWAY-ID="CDN-A"',
        "low.m3u8",
        "",
    ].join("\n");

    const playlistTexts = [
        { name: "section 9.1's playlist", text: SIMPLE_MEDIA_PLAYLIST },
        { name: "a Media Playlist with every tag but two", text: MEDIA_EVERY_TAG },
        { name: "an I-frames-only playlist", text: MEDIA_I_FRAMES },
        { name: "a Multivariant Playlist with every tag", text: MULTIVARIANT_EVERY_TAG },
        { name: "the Low-Latency playlist", text: LOW_LATENCY_LINES.join("\n") },
    ] as const;

    function parseText(text: string) {
        const outcome = HLS.safeParse(text);
        assertCondition(outcome.kind === ParseKind.parsed, `The playlist parsed as ${outcome.kind}: ${JSON.stringify(outcome)}`);
        return outcome.playlist;
    }

    test.each(playlistTexts)("parses what it writes for $name back to the same data", ({ text }) => {
        const playlist = parseText(text);
        const written = HLS.stringify(playlist);
        expect(parseText(written)).toEqual(playlist);
    });

    function* tagNamesOf(playlist: Playlist) {
        for (const key of Object.keys(playlist)) {
            yield key;
        }
        let units: readonly object[];
        if (playlist.kind === PlaylistKind.media) {
            units = playlist.segments;
        } else {
            units = playlist.variants;
        }
        for (const unit of units) {
            for (const key of Object.keys(unit)) {
                yield key;
            }
        }
        const hasPendingSegment = playlist.kind === PlaylistKind.media && playlist.pendingSegment !== undefined;
        if (hasPendingSegment) {
            for (const key of Object.keys(playlist.pendingSegment)) {
                yield key;
            }
        }
    }

    test.each(Object.values(PlaylistKind))("the %s fixtures carry every tag of that kind", (kind) => {
        const written = new Set<string>();
        for (const { text } of playlistTexts) {
            const playlist = parseText(text);
            if (playlist.kind === kind) {
                for (const name of tagNamesOf(playlist)) {
                    written.add(name);
                }
            }
        }
        const tables = defaultTagTables[kind];
        const playlistNames = Object.keys(tables.playlist.shape);
        const unitNames = Object.keys(tables.unit.shape);
        const names = playlistNames.concat(unitNames);
        const missing: string[] = [];
        for (const name of names) {
            if (!written.has(name)) {
                missing.push(name);
            }
        }
        expect(missing).toEqual([]);
    });

    test("writes section 9.1's playlist in the canonical form", () => {
        const expected = [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            "#EXT-X-TARGETDURATION:10",
            "#EXTINF:9.009,",
            "http://media.example.com/first.ts",
            "#EXTINF:9.009,",
            "http://media.example.com/second.ts",
            "#EXTINF:3.003,",
            "http://media.example.com/third.ts",
            "#EXT-X-ENDLIST",
            "",
        ].join("\n");
        const playlist = parseText(SIMPLE_MEDIA_PLAYLIST);
        expect(HLS.stringify(playlist)).toBe(expected);
    });

    test("writes a segment built by hand", () => {
        expect(HLS.stringify({ EXTINF: { duration: 0.0000001 }, uri: "a.ts", ignored: [] })).toBe("#EXTINF:0.0000001,\na.ts\n");
    });

    test("writes a spread playlist as it writes the playlist", () => {
        const playlist = parseText(MULTIVARIANT_EVERY_TAG);
        expect(HLS.stringify({ ...playlist })).toBe(HLS.stringify(playlist));
    });

    test("toHLS with canonical writes what HLS.stringify writes", () => {
        const playlist = parseText(MEDIA_EVERY_TAG);
        assertCondition(playlist.kind === PlaylistKind.media, `The playlist parsed as ${playlist.kind}.`);
        const [segment] = playlist.segments;
        assertCondition(segment !== undefined, "The playlist has no segment.");
        expect(playlist.toHLS({ canonical: true })).toBe(HLS.stringify(playlist));
        expect(segment.toHLS({ canonical: true })).toBe(HLS.stringify(segment));
    });
});
