// These tests pin the precompiled entry against the default entry: for a
// Media Playlist, a Multivariant Playlist, and a malformed playlist, both
// return equal outcomes, so compiling the tag schemas changes no result.
import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { HLS } from "../src/index.js";
import { HLS as PrecompiledHLS } from "../src/precompiled.js";

const FIXTURE_PATH = new URL("./fixtures/very-large-playlist.m3u8", import.meta.url);
const FIXTURE_ENCODING = "utf8";

const playlists = [
    { label: "the very large Media Playlist", text: readFileSync(FIXTURE_PATH, { encoding: FIXTURE_ENCODING }) },
    {
        label: "section 9.4's Multivariant Playlist",
        text: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000\nhttp://example.com/low.m3u8\n",
    },
    { label: "a playlist whose EXTINF has no duration", text: "#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:,\nfirst.ts\n" },
] as const;

describe("the precompiled entry", () => {
    test.each(playlists)("returns the default entry's outcome for $label", ({ text }) => {
        const expected = HLS.safeParse(text);
        expect(PrecompiledHLS.safeParse(text)).toEqual(expected);
    });
});
