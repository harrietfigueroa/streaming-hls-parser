// These tests pin section 4.4.3.5: the playlist type is EVENT or VOD, written
// in uppercase.
import { describe, expect, test } from "vitest";

import { extXPlaylistTypeSchema, PlaylistType } from "../../../../src/4-playlists/4.4-playlist-tags/4.4.3-media-playlist-tags/4.4.3.5-ext-x-playlist-type.js";

describe("extXPlaylistTypeSchema", () => {
    test.each([PlaylistType.event, PlaylistType.vod])("accepts %s", (value) => {
        expect(extXPlaylistTypeSchema.safeParse(value)).toEqual({ success: true, data: value });
    });

    test.each([true, "", "vod", "LIVE"])("rejects the value %j", (value) => {
        expect(extXPlaylistTypeSchema.safeParse(value).success).toBe(false);
    });
});
