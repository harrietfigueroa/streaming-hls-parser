// These tests pin the static Media Playlist path through the default entry:
// section 9.1's example parses to its typed playlist, ignored lines keep their
// position, and each malformed case breaks exactly one rule of a valid base.
import { describe, expect, test } from "vitest";

import { HLS, IgnoredKind, type MediaPlaylist, ParseKind, PlaylistKind } from "../src/index.js";
import { attributeListRules } from "../src/4-playlists/4.2-attribute-lists.js";
import { extXStartRules } from "../src/4-playlists/4.4-playlist-tags/4.4.2-media-or-multivariant-playlist-tags/4.4.2.2-ext-x-start.js";
import { ignoreReasons } from "../src/6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
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
        expect(outcome.kind).toBe(ParseKind.parsed);
        if (outcome.kind === ParseKind.parsed) {
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
    ] as const;

    test.each(malformed)("reports $name as malformed", ({ text, rule }) => {
        const outcome = HLS.safeParse(text);
        expect(outcome).toMatchObject({ kind: ParseKind.malformed, issues: [{ rule }] });
    });
});
