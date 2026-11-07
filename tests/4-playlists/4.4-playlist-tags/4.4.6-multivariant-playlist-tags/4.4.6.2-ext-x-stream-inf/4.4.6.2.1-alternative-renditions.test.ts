// These tests pin section 4.4.6.2.1: an EXT-X-MEDIA of TYPE SUBTITLES has a
// URI, which AUDIO and VIDEO Renditions may leave out.
import { describe, expect, test } from "vitest";

import { MediaType } from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.1-ext-x-media/4.4.6.1-ext-x-media.js";
import {
    alternativeRenditionRules,
    checkAlternativeRendition,
} from "../../../../../src/4-playlists/4.4-playlist-tags/4.4.6-multivariant-playlist-tags/4.4.6.2-ext-x-stream-inf/4.4.6.2.1-alternative-renditions.js";

describe("checkAlternativeRendition", () => {
    test.each([
        { TYPE: MediaType.subtitles, "GROUP-ID": "s", NAME: "English", URI: "s.m3u8" },
        { TYPE: MediaType.audio, "GROUP-ID": "a", NAME: "English" },
        { TYPE: MediaType.video, "GROUP-ID": "v", NAME: "Main" },
    ] as const)("accepts %j", (media) => {
        expect(checkAlternativeRendition(media)).toEqual([]);
    });

    test("reports a SUBTITLES Rendition without a URI", () => {
        const media = { TYPE: MediaType.subtitles, "GROUP-ID": "s", NAME: "English" } as const;
        expect(checkAlternativeRendition(media)).toMatchObject([{ rule: alternativeRenditionRules.subtitlesUri }]);
    });
});
