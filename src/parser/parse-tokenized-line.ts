import parseVersion from '../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseExtendedM3U from '../hls/playlist-tags/basic-tags/EXTM3U/parser';
import parseIndependentSegments from '../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/parser';
import parseStart from '../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/parser';
import parseDiscontinuitySequence from '../hls/playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/parser';
import parseEndlist from '../hls/playlist-tags/media-playlist-tags/EXT-X-ENDLIST/parser';
import parseIFramesOnly from '../hls/playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/parser';
import parseMediaSequence from '../hls/playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/parser';
import parsePlaylistType from '../hls/playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/parser';
import parseTargetDuration from '../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseByteRange from '../hls/playlist-tags/media-segment-tags/EXT-X-BYTERANGE/parser';
import parseDateRange from '../hls/playlist-tags/media-segment-tags/EXT-X-DATERANGE/parser';
import parseDiscontinuity from '../hls/playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/parser';
import parseKey from '../hls/playlist-tags/media-segment-tags/EXT-X-KEY/parser';
import parseMap from '../hls/playlist-tags/media-segment-tags/EXT-X-MAP/parser';
import parseProgramDateTime from '../hls/playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/parser';
import parseInf from '../hls/playlist-tags/media-segment-tags/EXTINF/parser';
import parseIFrameStreamInf from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/parser';
import parseMedia from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/parser';
import parseSessionData from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/parser';
import parseSessionKey from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/parser';
import parseStreamInf from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/parser';
import { LexicalToken } from './parser.interfaces';

export function parseTokenizedLine(line: LexicalToken) {
    switch (line.type) {
        // Media Segment Tags
        case '#EXTINF': {
            line.value = parseInf(line.source as any);
            break;
        }
        case 'URI': {
            line.value = line.source;
            break;
        }
        case '#EXT-X-BYTERANGE': {
            line.value = parseByteRange(line.source as any);
            break;
        }
        case '#EXT-X-DISCONTINUITY': {
            line.value = parseDiscontinuity(line.source as any);
            break;
        }
        case '#EXT-X-KEY': {
            line.value = parseKey(line.source as any);
            break;
        }
        case '#EXT-X-MAP': {
            line.value = parseMap(line.source as any);
            break;
        }
        case '#EXT-X-PROGRAM-DATE-TIME': {
            line.value = parseProgramDateTime(line.source as any);
            break;
        }
        case '#EXT-X-DATERANGE': {
            line.value = parseDateRange(line.source as any);
            break;
        }

        // Media or Multivariant Playlist Tags
        case '#EXTM3U': {
            line.value = parseExtendedM3U(line.source);
            break;
        }
        case '#EXT-X-VERSION': {
            line.value = parseVersion(line.source);
            break;
        }
        case '#EXT-X-TARGETDURATION': {
            line.value = parseTargetDuration(line.source);
            break;
        }
        case '#EXT-X-MEDIA-SEQUENCE': {
            line.value = parseMediaSequence(line.source);
            break;
        }
        case '#EXT-X-DISCONTINUITY-SEQUENCE': {
            line.value = parseDiscontinuitySequence(line.source);
            break;
        }
        case '#EXT-X-ENDLIST': {
            line.value = parseEndlist(line.source);
            break;
        }
        case '#EXT-X-PLAYLIST-TYPE': {
            line.value = parsePlaylistType(line.source);
            break;
        }
        case '#EXT-X-I-FRAMES-ONLY': {
            line.value = parseIFramesOnly(line.source);
            break;
        }
        case '#EXT-X-INDEPENDENT-SEGMENTS': {
            line.value = parseIndependentSegments(line.source);
            break;
        }
        case '#EXT-X-START': {
            line.value = parseStart(line.source);
            break;
        }
        case '#EXT-X-MEDIA': {
            return {
                ...line,
                value: parseMedia(line.source as any),
            };
        }
        case '#EXT-X-STREAM-INF': {
            return {
                ...line,
                value: parseStreamInf(line.source as any),
            };
        }
        case '#EXT-X-I-FRAME-STREAM-INF': {
            return {
                ...line,
                value: parseIFrameStreamInf(line.source as any),
            };
        }
        case '#EXT-X-SESSION-DATA': {
            return {
                ...line,
                value: parseSessionData(line.source as any),
            };
        }
        case '#EXT-X-SESSION-KEY': {
            return {
                ...line,
                value: parseSessionKey(line.source as any),
            };
        }
        case '#EXT-X-INDEPENDENT-SEGMENTS': {
            return {
                ...line,
                value: parseIndependentSegments(line.source as any),
            };
        }
        case '#EXT-X-START': {
            return {
                ...line,
                value: parseStart(line.source as any),
            };
        }
    }
    return line;
}
