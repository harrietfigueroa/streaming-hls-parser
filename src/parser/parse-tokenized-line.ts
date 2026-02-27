import { playlistTagRegistry } from '../hls/playlist-tags/playlist-tag.registry';
import { EXTINF_CODEC } from '../hls/playlist-tags/media-segment-tags/EXTINF/schema';
import { LexicalToken } from './parser.interfaces';

/**
 * Helper function to safely decode a tag and attach errors to the token if decoding fails
 */
function safeDecodeTag(
    codec: { safeDecode: (input: any) => any },
    source: string,
    line: LexicalToken,
): void {
    const result = codec.safeDecode(source);
    if (result.success) {
        line.value = result.data;
    } else {
        line.errors = result.error.issues;
        line.value = undefined;
    }
}

export function parseTokenizedLine(line: LexicalToken) {
    switch (line.type) {
        // Media Segment Tags
        case '#EXTINF':
            safeDecodeTag(EXTINF_CODEC, line.source as any, line);
            break;
        case 'URI':
            line.value = line.source;
            break;
        case '#EXT-X-BYTERANGE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-BYTERANGE'], line.source as any, line);
            break;
        case '#EXT-X-DISCONTINUITY':
            safeDecodeTag(playlistTagRegistry['#EXT-X-DISCONTINUITY'], line.source as any, line);
            break;
        case '#EXT-X-KEY':
            safeDecodeTag(playlistTagRegistry['#EXT-X-KEY'], line.source as any, line);
            break;
        case '#EXT-X-MAP':
            safeDecodeTag(playlistTagRegistry['#EXT-X-MAP'], line.source as any, line);
            break;
        case '#EXT-X-PROGRAM-DATE-TIME':
            safeDecodeTag(playlistTagRegistry['#EXT-X-PROGRAM-DATE-TIME'], line.source as any, line);
            break;
        case '#EXT-X-DATERANGE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-DATERANGE'], line.source as any, line);
            break;
        case '#EXT-X-GAP':
            safeDecodeTag(playlistTagRegistry['#EXT-X-GAP'], line.source as any, line);
            break;
        case '#EXT-X-BITRATE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-BITRATE'], line.source as any, line);
            break;
        case '#EXT-X-PART':
            safeDecodeTag(playlistTagRegistry['#EXT-X-PART'], line.source as any, line);
            break;
        case '#EXT-X-CUE-OUT':
            safeDecodeTag(playlistTagRegistry['#EXT-X-CUE-OUT'], line.source as any, line);
            break;
        case '#EXT-X-CUE-IN':
            safeDecodeTag(playlistTagRegistry['#EXT-X-CUE-IN'], line.source as any, line);
            break;
        case '#EXT-X-CUE-OUT-CONT':
            safeDecodeTag(playlistTagRegistry['#EXT-X-CUE-OUT-CONT'], line.source as any, line);
            break;
        case '#EXT-X-ASSET':
            safeDecodeTag(playlistTagRegistry['#EXT-X-ASSET'], line.source as any, line);
            break;
        case '#EXT-X-SPLICEPOINT-SCTE35':
            safeDecodeTag(playlistTagRegistry['#EXT-X-SPLICEPOINT-SCTE35'], line.source as any, line);
            break;

        // Media or Multivariant Playlist Tags
        case '#EXTM3U':
            safeDecodeTag(playlistTagRegistry['#EXTM3U'], line.source as any, line);
            break;
        case '#EXT-X-VERSION':
            safeDecodeTag(playlistTagRegistry['#EXT-X-VERSION'], line.source as any, line);
            break;
        case '#EXT-X-TARGETDURATION':
            safeDecodeTag(playlistTagRegistry['#EXT-X-TARGETDURATION'], line.source as any, line);
            break;
        case '#EXT-X-MEDIA-SEQUENCE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-MEDIA-SEQUENCE'], line.source as any, line);
            break;
        case '#EXT-X-DISCONTINUITY-SEQUENCE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-DISCONTINUITY-SEQUENCE'], line.source as any, line);
            break;
        case '#EXT-X-ENDLIST':
            safeDecodeTag(playlistTagRegistry['#EXT-X-ENDLIST'], line.source as any, line);
            break;
        case '#EXT-X-PLAYLIST-TYPE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-PLAYLIST-TYPE'], line.source as any, line);
            break;
        case '#EXT-X-I-FRAMES-ONLY':
            safeDecodeTag(playlistTagRegistry['#EXT-X-I-FRAMES-ONLY'], line.source as any, line);
            break;
        case '#EXT-X-INDEPENDENT-SEGMENTS':
            safeDecodeTag(playlistTagRegistry['#EXT-X-INDEPENDENT-SEGMENTS'], line.source as any, line);
            break;
        case '#EXT-X-START':
            safeDecodeTag(playlistTagRegistry['#EXT-X-START'], line.source as any, line);
            break;
        case '#EXT-X-MEDIA':
            safeDecodeTag(playlistTagRegistry['#EXT-X-MEDIA'], line.source as any, line);
            break;
        case '#EXT-X-STREAM-INF':
            safeDecodeTag(playlistTagRegistry['#EXT-X-STREAM-INF'], line.source as any, line);
            break;
        case '#EXT-X-I-FRAME-STREAM-INF':
            safeDecodeTag(playlistTagRegistry['#EXT-X-I-FRAME-STREAM-INF'], line.source as any, line);
            break;
        case '#EXT-X-SESSION-DATA':
            safeDecodeTag(playlistTagRegistry['#EXT-X-SESSION-DATA'], line.source as any, line);
            break;
        case '#EXT-X-SESSION-KEY':
            safeDecodeTag(playlistTagRegistry['#EXT-X-SESSION-KEY'], line.source as any, line);
            break;
        case '#EXT-X-DEFINE':
            safeDecodeTag(playlistTagRegistry['#EXT-X-DEFINE'], line.source as any, line);
            break;
        case '#EXT-X-SERVER-CONTROL':
            safeDecodeTag(playlistTagRegistry['#EXT-X-SERVER-CONTROL'], line.source as any, line);
            break;
        case '#EXT-X-PART-INF':
            safeDecodeTag(playlistTagRegistry['#EXT-X-PART-INF'], line.source as any, line);
            break;
        case '#EXT-X-PRELOAD-HINT':
            safeDecodeTag(playlistTagRegistry['#EXT-X-PRELOAD-HINT'], line.source as any, line);
            break;
        case '#EXT-X-SKIP':
            safeDecodeTag(playlistTagRegistry['#EXT-X-SKIP'], line.source as any, line);
            break;
        case '#EXT-X-RENDITION-REPORT':
            safeDecodeTag(playlistTagRegistry['#EXT-X-RENDITION-REPORT'], line.source as any, line);
            break;
        case '#EXT-X-CONTENT-STEERING':
            safeDecodeTag(playlistTagRegistry['#EXT-X-CONTENT-STEERING'], line.source as any, line);
            break;
    }
    return line;
}
