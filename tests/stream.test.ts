// These tests pin the streaming parse against the static one: for each playlist,
// cut into chunks of several sizes as strings and as bytes, the streamed units
// equal the static playlist's, the playlist tags carry its values, the texts
// joined in order are the input, and each failure ends the stream as its last part.
import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { definitionRules } from "../src/4-playlists/4.1-definition-of-a-playlist.js";
import { extXTargetDurationRules } from "../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.1-ext-x-targetduration.js";
import { extm3uRules } from "../src/4-playlists/4.4-playlist-tags/4.4.1-basic-tags/4.4.1.1-extm3u.js";
import { ignoreReasons } from "../src/6-client-server-responsibilities/6.3-client-responsibilities/6.3.1-general-client-responsibilities.js";
import { HLS, IgnoredKind, Limit, ParseKind, type Playlist, PlaylistKind, type StreamPart, StreamPartKind } from "../src/index.js";
import { assertCondition, unreachable } from "../src/library/assert.js";

const FIXTURE_PATH = new URL("./fixtures/very-large-playlist.m3u8", import.meta.url);
const FIXTURE_ENCODING = "utf8";
const CHUNK_SIZES = [1, 5, 64, 100_000] as const;
const encoder = new TextEncoder();

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
    "#EXT-X-DISCONTINUITY",
    "#EXTINF:4.00008,",
    "midRoll273.mp4",
    '#EXT-X-PART:DURATION=2.00004,INDEPENDENT=YES,URI="midRoll274.0.mp4"',
    '#EXT-X-PRELOAD-HINT:TYPE=PART,URI="midRoll274.1.mp4"',
    "# trailing",
].join("\r\n");

const playlists = [
    { name: "section 9.1's playlist", text: SIMPLE_MEDIA_PLAYLIST },
    { name: "a playlist with comments, a playlist tag among a segment's tags, and no final line feed", text: "#EXTM3U\n# head\n#EXT-X-TARGETDURATION:10\n# lead\n#EXTINF:1,\n#EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00\n#EXT-X-DATERANGE:ID=\"ad\",START-DATE=\"2010-02-19T14:54:23Z\"\na.ts\n#EXT-X-ENDLIST" },
    { name: "a Low-Latency playlist of CR LF lines with its pending segment", text: LOW_LATENCY_PLAYLIST },
    { name: "a playlist with an ignored playlist tag", text: "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXT-X-START:TIME-OFFSET=1,REQ-FUTURE=1\n#EXTINF:1,\na.ts\n" },
    { name: "a playlist with a byte range following a sub-range", text: "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:1,\n#EXT-X-BYTERANGE:100@0\na.ts\n#EXTINF:1,\n#EXT-X-BYTERANGE:50\na.ts\n" },
    { name: "a Multivariant Playlist with an ignored variant", text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1,REQ-FUTURE=1\nfuture.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2\nb.m3u8\n# end\n" },
    { name: "a Multivariant Playlist with an ignored variant before a playlist tag", text: '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1,REQ-FUTURE=1\nfuture.m3u8\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",URI="en.m3u8"\n#EXT-X-STREAM-INF:BANDWIDTH=2,AUDIO="aac"\nb.m3u8\n' },
    { name: "a Multivariant Playlist with renditions", text: '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="en.m3u8"\n#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="mp4a.40.2",AUDIO="aac"\nlow.m3u8\n' },
    { name: "the very large Media Playlist", text: readFileSync(FIXTURE_PATH, { encoding: FIXTURE_ENCODING }) },
] as const;

async function* fromChunks<Chunk>(chunks: readonly Chunk[]) {
    for (const chunk of chunks) {
        yield chunk;
    }
}

function cut(text: string, size: number) {
    const chunks: string[] = [];
    for (let start = 0; start < text.length; start += size) {
        chunks.push(text.slice(start, start + size));
    }
    return chunks;
}

function cutBytes(text: string, size: number) {
    const bytes = encoder.encode(text);
    const chunks: Uint8Array[] = [];
    for (let start = 0; start < bytes.length; start += size) {
        chunks.push(bytes.subarray(start, start + size));
    }
    return chunks;
}

async function collect<Part>(parts: AsyncIterable<Part>) {
    const collected: Part[] = [];
    for await (const part of parts) {
        collected.push(part);
    }
    return collected;
}

function streamText(text: string) {
    const chunks = fromChunks([text]);
    return streamChunks(chunks);
}

function streamChunks(chunks: AsyncIterable<string> | AsyncIterable<Uint8Array>) {
    const parts = HLS.safeParse(chunks);
    return collect(parts);
}

function playlistTagNamesOf(parts: readonly StreamPart[]) {
    const names: string[] = [];
    for (const part of parts) {
        if (part.kind === StreamPartKind.playlistTag) {
            names.push(part.playlistTag.name);
        }
    }
    return names;
}

function parseStatic(text: string) {
    const outcome = HLS.safeParse(text);
    assertCondition(outcome.kind === ParseKind.parsed, `The playlist parsed as ${outcome.kind}.`);
    return outcome;
}

/** The text a streamed part contributes to the input: an output object's toHLS, or the end's own text. */
function textOf(part: StreamPart) {
    switch (part.kind) {
        case StreamPartKind.playlistTag: {
            return part.playlistTag.toHLS();
        }
        case StreamPartKind.segment: {
            return part.segment.toHLS();
        }
        case StreamPartKind.pendingSegment: {
            return part.pendingSegment.toHLS();
        }
        case StreamPartKind.variant: {
            return part.variant.toHLS();
        }
        case StreamPartKind.end: {
            return part.text;
        }
        case StreamPartKind.malformed:
        case StreamPartKind.limitExceeded: {
            return "";
        }
        default: {
            part satisfies never;
            return unreachable(part);
        }
    }
}

function unitsOf(playlist: Playlist) {
    if (playlist.kind === PlaylistKind.media) {
        return playlist.segments;
    }
    return playlist.variants;
}

function streamedUnitsOf(parts: readonly StreamPart[]) {
    const units: unknown[] = [];
    for (const part of parts) {
        if (part.kind === StreamPartKind.segment) {
            units.push(part.segment);
        } else if (part.kind === StreamPartKind.variant) {
            units.push(part.variant);
        }
    }
    return units;
}

function lastOf(parts: readonly StreamPart[]) {
    const last = parts.at(-1);
    assertCondition(last !== undefined, "The stream yielded no part.");
    return last;
}

describe("the streaming parse", () => {
    test.each(playlists)("yields the static playlist's units for $name", async ({ text }) => {
        const parts = await streamText(text);
        const { playlist } = parseStatic(text);
        expect(streamedUnitsOf(parts)).toStrictEqual(unitsOf(playlist));
    });

    test.each(playlists)("yields units whose texts are the static units' texts for $name", async ({ text }) => {
        const parts = await streamText(text);
        const { playlist } = parseStatic(text);
        const streamedTexts = Array.from(streamedUnitsOf(parts), String);
        const staticTexts = Array.from(unitsOf(playlist), String);
        expect(streamedTexts).toStrictEqual(staticTexts);
    });

    test.each(playlists)("yields texts that join to the input for $name", async ({ text }) => {
        const parts = await streamText(text);
        const joined = Array.from(parts, textOf).join("");
        expect(joined).toBe(text);
    });

    test.each(playlists)("ends with the static playlist's kind, ignored lines, and violations for $name", async ({ text }) => {
        const parts = await streamText(text);
        const { playlist, violations } = parseStatic(text);
        expect(lastOf(parts)).toMatchObject({
            kind: StreamPartKind.end,
            playlistKind: playlist.kind,
            ignored: playlist.ignored,
            violations,
        });
    });

    test.each(playlists)("yields each playlist tag with the static playlist's value for $name", async ({ text }) => {
        const parts = await streamText(text);
        const { playlist } = parseStatic(text);
        const values = new Map<string, unknown[]>();
        for (const part of parts) {
            if (part.kind === StreamPartKind.playlistTag) {
                const written = values.get(part.playlistTag.name);
                if (written === undefined) {
                    values.set(part.playlistTag.name, [part.playlistTag.value]);
                } else {
                    written.push(part.playlistTag.value);
                }
            }
        }
        for (const [name, written] of values) {
            const expected: unknown = Reflect.get(playlist, name);
            if (Array.isArray(expected)) {
                expect(written).toStrictEqual(expected);
            } else {
                expect(written).toStrictEqual([expected]);
            }
        }
        expect(values.size).toBeGreaterThan(0);
    });

    test("yields the pending segment the static playlist has", async () => {
        const parts = await streamText(LOW_LATENCY_PLAYLIST);
        const { playlist } = parseStatic(LOW_LATENCY_PLAYLIST);
        assertCondition(playlist.kind === PlaylistKind.media, `The playlist parsed as ${playlist.kind}.`);
        expect(parts).toContainEqual({ kind: StreamPartKind.pendingSegment, pendingSegment: playlist.pendingSegment });
    });

    test("keeps an ignored playlist tag out of the parts and in the next segment's ignored lines", async () => {
        const tag = "#EXT-X-START:TIME-OFFSET=1,REQ-FUTURE=1";
        const parts = await streamText(`#EXTM3U\n#EXT-X-TARGETDURATION:10\n${tag}\n#EXTINF:1,\na.ts\n`);
        expect(playlistTagNamesOf(parts)).toStrictEqual(["EXTM3U", "EXT-X-TARGETDURATION"]);
        const [segment] = streamedUnitsOf(parts);
        expect(segment).toMatchObject({ ignored: [{ kind: IgnoredKind.ignoredTag, line: tag, reason: ignoreReasons.unrecognizedRequiredAttribute }] });
    });

    const sizes = CHUNK_SIZES.flatMap((size) => [
        { name: `string chunks of ${size}`, chunks: () => fromChunks(cut(LOW_LATENCY_PLAYLIST, size)) },
        { name: `byte chunks of ${size}`, chunks: () => fromChunks(cutBytes(LOW_LATENCY_PLAYLIST, size)) },
    ]);

    test.each(sizes)("yields the same parts from $name", async ({ chunks }) => {
        const expected = await streamText(LOW_LATENCY_PLAYLIST);
        const parts = await streamChunks(chunks());
        expect(parts).toStrictEqual(expected);
    });

    test("ends with malformed when a required playlist tag is absent, after the units it read", async () => {
        const parts = await streamText("#EXTM3U\n#EXTINF:1,\na.ts\n");
        expect(streamedUnitsOf(parts)).toHaveLength(1);
        expect(lastOf(parts)).toMatchObject({
            kind: StreamPartKind.malformed,
            issues: [{ rule: extXTargetDurationRules.required }],
        });
    });

    test("ends with malformed at a line the scan rejects", async () => {
        const parts = await streamText("#EXT-X-TARGETDURATION:10\n");
        expect(parts).toStrictEqual([{ kind: StreamPartKind.malformed, issues: [expect.objectContaining({ rule: extm3uRules.identification })] }]);
    });

    test("ends with malformed on invalid UTF-8", async () => {
        const bytes = Uint8Array.from([...encoder.encode("#EXTM3U\n"), 0xff, 0x0a]);
        const chunks = fromChunks([bytes]);
        const parts = await streamChunks(chunks);
        expect(lastOf(parts)).toMatchObject({ kind: StreamPartKind.malformed, issues: [{ rule: definitionRules.utf8Encoding }] });
    });

    test("ends with limitExceeded for a line past its bound", async () => {
        const lineBytesMax = 16;
        const text = `#EXTM3U\n#${"a".repeat(lineBytesMax)}\n`;
        const chunks = fromChunks([text]);
        const stream = HLS.safeParse(chunks, { limits: { lineBytesMax } });
        const parts = await collect(stream);
        expect(lastOf(parts)).toStrictEqual({ kind: StreamPartKind.limitExceeded, limit: Limit.lineBytesMax, value: lineBytesMax });
    });

    test("runs a reviver on each output object", async () => {
        const chunks = fromChunks([SIMPLE_MEDIA_PLAYLIST]);
        const stream = HLS.safeParse(chunks, bigIntsToStrings);
        const parts = await collect(stream);
        expect(parts).toContainEqual({ kind: StreamPartKind.playlistTag, playlistTag: { name: "EXT-X-TARGETDURATION", value: "10" } });
        expect(parts).toContainEqual(
            expect.objectContaining({ kind: StreamPartKind.segment, segment: expect.objectContaining({ mediaSequenceNumber: "2" }) }),
        );
    });

    test("parse yields the parts safeParse yields when the playlist parses", async () => {
        const chunks = fromChunks([SIMPLE_MEDIA_PLAYLIST]);
        const stream = HLS.parse(chunks);
        const parts = await collect(stream);
        const expected = await streamText(SIMPLE_MEDIA_PLAYLIST);
        expect(parts).toStrictEqual(expected);
    });

    test("parse rejects with a SyntaxError for a malformed playlist", async () => {
        const chunks = fromChunks(["#EXTM3U\n#EXTINF:1,\na.ts\n"]);
        const stream = HLS.parse(chunks);
        await expect(collect(stream)).rejects.toThrow(SyntaxError);
    });

    test("parse rejects with a RangeError for an exceeded limit", async () => {
        const parts = HLS.parse(fromChunks(["#EXTM3U\n#EXTINF:1,\na.ts\n"]), { limits: { lineBytesMax: 4 } });
        await expect(collect(parts)).rejects.toThrow(RangeError);
    });
});

function bigIntsToStrings(this: unknown, _key: string, value: unknown) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
}
