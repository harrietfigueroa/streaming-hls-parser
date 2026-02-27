import { playlistTagRegistry } from '../hls/playlist-tags/playlist-tag.registry';
import { EXTINF_CODEC } from '../hls/playlist-tags/media-segment-tags/EXTINF/schema';
import { LexicalToken } from './parser.interfaces';

export function parseTokenizedLine(line: LexicalToken) {
    switch (line.type) {
        // Media Segment Tags
        case '#EXTINF': {
            line.value = EXTINF_CODEC.decode(line.source as any);
            break;
        }
        case 'URI': {
            line.value = line.source;
            break;
        }
        case '#EXT-X-BYTERANGE': {
            line.value = playlistTagRegistry['#EXT-X-BYTERANGE'].decode(line.source as any);
            break;
        }
        case '#EXT-X-DISCONTINUITY': {
            line.value = playlistTagRegistry['#EXT-X-DISCONTINUITY'].decode(line.source as any);
            break;
        }
        case '#EXT-X-KEY': {
            line.value = playlistTagRegistry['#EXT-X-KEY'].decode(line.source as any);
            break;
        }
        case '#EXT-X-MAP': {
            line.value = playlistTagRegistry['#EXT-X-MAP'].decode(line.source as any);
            break;
        }
        case '#EXT-X-PROGRAM-DATE-TIME': {
            line.value = playlistTagRegistry['#EXT-X-PROGRAM-DATE-TIME'].decode(line.source as any);
            break;
        }
        case '#EXT-X-DATERANGE': {
            line.value = playlistTagRegistry['#EXT-X-DATERANGE'].decode(line.source as any);
            break;
        }

        // Media or Multivariant Playlist Tags
        case '#EXTM3U': {
            line.value = playlistTagRegistry['#EXTM3U'].decode(line.source as any);
            break;
        }
        case '#EXT-X-VERSION': {
            line.value = playlistTagRegistry['#EXT-X-VERSION'].decode(line.source as any);
            break;
        }
        case '#EXT-X-TARGETDURATION': {
            line.value = playlistTagRegistry['#EXT-X-TARGETDURATION'].decode(line.source as any);
            break;
        }
        case '#EXT-X-MEDIA-SEQUENCE': {
            line.value = playlistTagRegistry['#EXT-X-MEDIA-SEQUENCE'].decode(line.source as any);
            break;
        }
        case '#EXT-X-DISCONTINUITY-SEQUENCE': {
            line.value = playlistTagRegistry['#EXT-X-DISCONTINUITY-SEQUENCE'].decode(
                line.source as any,
            );
            break;
        }
        case '#EXT-X-ENDLIST': {
            line.value = playlistTagRegistry['#EXT-X-ENDLIST'].decode(line.source as any);
            break;
        }
        case '#EXT-X-PLAYLIST-TYPE': {
            line.value = playlistTagRegistry['#EXT-X-PLAYLIST-TYPE'].decode(line.source as any);
            break;
        }
        case '#EXT-X-I-FRAMES-ONLY': {
            line.value = playlistTagRegistry['#EXT-X-I-FRAMES-ONLY'].decode(line.source as any);
            break;
        }
        case '#EXT-X-INDEPENDENT-SEGMENTS': {
            line.value = playlistTagRegistry['#EXT-X-INDEPENDENT-SEGMENTS'].decode(
                line.source as any,
            );
            break;
        }
        case '#EXT-X-START': {
            line.value = playlistTagRegistry['#EXT-X-START'].decode(line.source as any);
            break;
        }
        case '#EXT-X-MEDIA': {
            line.value = playlistTagRegistry['#EXT-X-MEDIA'].decode(line.source as any);
            break;
        }
        case '#EXT-X-STREAM-INF': {
            line.value = playlistTagRegistry['#EXT-X-STREAM-INF'].decode(line.source as any);
            break;
        }
        case '#EXT-X-I-FRAME-STREAM-INF': {
            line.value = playlistTagRegistry['#EXT-X-I-FRAME-STREAM-INF'].decode(
                line.source as any,
            );
            break;
        }
        case '#EXT-X-SESSION-DATA': {
            line.value = playlistTagRegistry['#EXT-X-SESSION-DATA'].decode(line.source as any);
            break;
        }
        case '#EXT-X-SESSION-KEY': {
            line.value = playlistTagRegistry['#EXT-X-SESSION-KEY'].decode(line.source as any);
            break;
        }
    }
    return line;
}
