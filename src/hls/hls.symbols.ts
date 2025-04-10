/**
 * @file
In this file we're registering all of our global HLS Tag symbols
No need to export since we should be grabbing them with the function
in ./hls-tag.ts
 */

const wellKnownHLSTags = [
    // Basic
    Symbol('#EXTM3U'),
    Symbol('#EXT-X-VERSION'),

    // Media Segment
    Symbol('#EXTINF'),
    Symbol('#EXT-X-BYTERANGE'),
    Symbol('#EXT-X-DISCONTINUITY'),
    Symbol('#EXT-X-KEY'),
    Symbol('#EXT-X-MAP'),
    Symbol('#EXT-X-PROGRAM-DATE-TIME'),
    Symbol('#EXT-X-DATERANGE'),
    Symbol('URI'),

    // Media Playlist
    Symbol('#EXT-X-TARGETDURATION'),
    Symbol('#EXT-X-MEDIA-SEQUENCE'),
    Symbol('#EXT-X-DISCONTINUITY-SEQUENCE'),
    Symbol('#EXT-X-ENDLIST'),
    Symbol('#EXT-X-PLAYLIST-TYPE'),
    Symbol('#EXT-X-I-FRAMES-ONLY'),

    // Multivariant Playlist
    Symbol('#EXT-X-MEDIA'),
    Symbol('#EXT-X-STREAM-INF'),
    Symbol('#EXT-X-I-FRAME-STREAM-INF'),
    Symbol('#EXT-X-SESSION-DATA'),
    Symbol('#EXT-X-SESSION-KEY'),

    // Media Playlist or Multivariant Playlist
    Symbol('#EXT-X-INDEPENDENT-SEGMENTS'),
    Symbol('#EXT-X-START'),
];

export function isWellKnownTag(hlsTag: symbol): hlsTag is (typeof wellKnownHLSTags)[number] {
    for (const wellKnownHLSTag of wellKnownHLSTags) {
        if (wellKnownHLSTag === hlsTag) return true;
    }
    return false;
}
