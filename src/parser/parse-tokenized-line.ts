import versionTag from '../hls/playlist-tags/basic-tags/EXT-X-VERSION/index';
import m3uTag from '../hls/playlist-tags/basic-tags/EXTM3U/index';
import independentSegmentsTag from '../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/index';
import startTag from '../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/index';
import { extXDiscontinuitySequenceParser } from '../hls/playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/parser';
import { extXEndListParser } from '../hls/playlist-tags/media-playlist-tags/EXT-X-ENDLIST/parser';
import { extXIFramesOnlyParser } from '../hls/playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/parser';
import { extXMediaSequenceParser } from '../hls/playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/parser';
import { extXPlaylistTypeParser } from '../hls/playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/parser';
import { extXTargetDurationParser } from '../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import { extXByteRangeParser } from '../hls/playlist-tags/media-segment-tags/EXT-X-BYTERANGE/parser';
import { extXDateRangeParser } from '../hls/playlist-tags/media-segment-tags/EXT-X-DATERANGE/parser';
import { extXDiscontinuityParser } from '../hls/playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/parser';
import { extXKeyParser } from '../hls/playlist-tags/media-segment-tags/EXT-X-KEY/parser';
import { extXMapParser } from '../hls/playlist-tags/media-segment-tags/EXT-X-MAP/parser';
import { extXProgramDateTimeParser } from '../hls/playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/parser';
import { extinfParser } from '../hls/playlist-tags/media-segment-tags/EXTINF/parser';
import parseMedia from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/parser';
import parseSessionData from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/parser';
import parseSessionKey from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/parser';
import { extXStreamInfParser } from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/parser';
import { extXIFrameStreamInfParser } from '../hls/playlist-tags/multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/parser';
import { LexicalToken } from './parser.interfaces';

export function parseTokenizedLine(line: LexicalToken) {
    switch (line.type) {
        // Media Segment Tags
        case '#EXTINF': {
            line.value = extinfParser(line.source as any);
            break;
        }
        case 'URI': {
            line.value = line.source;
            break;
        }
        case '#EXT-X-BYTERANGE': {
            line.value = extXByteRangeParser(line.source as any);
            break;
        }
        case '#EXT-X-DISCONTINUITY': {
            line.value = extXDiscontinuityParser(line.source as any);
            break;
        }
        case '#EXT-X-KEY': {
            line.value = extXKeyParser(line.source as any);
            break;
        }
        case '#EXT-X-MAP': {
            line.value = extXMapParser(line.source as any);
            break;
        }
        case '#EXT-X-PROGRAM-DATE-TIME': {
            line.value = extXProgramDateTimeParser(line.source as any);
            break;
        }
        case '#EXT-X-DATERANGE': {
            line.value = extXDateRangeParser(line.source as any);
            break;
        }

        // Media or Multivariant Playlist Tags
        case '#EXTM3U': {
            line.value = m3uTag.parser(line.source);
            break;
        }
        case '#EXT-X-VERSION': {
            line.value = versionTag.parser(line.source);
            break;
        }
        case '#EXT-X-TARGETDURATION': {
            line.value = extXTargetDurationParser(line.source);
            break;
        }
        case '#EXT-X-MEDIA-SEQUENCE': {
            line.value = extXMediaSequenceParser(line.source);
            break;
        }
        case '#EXT-X-DISCONTINUITY-SEQUENCE': {
            line.value = extXDiscontinuitySequenceParser(line.source);
            break;
        }
        case '#EXT-X-ENDLIST': {
            line.value = extXEndListParser(line.source);
            break;
        }
        case '#EXT-X-PLAYLIST-TYPE': {
            line.value = extXPlaylistTypeParser(line.source);
            break;
        }
        case '#EXT-X-I-FRAMES-ONLY': {
            line.value = extXIFramesOnlyParser(line.source);
            break;
        }
        case '#EXT-X-INDEPENDENT-SEGMENTS': {
            line.value = independentSegmentsTag.parser(line.source);
            break;
        }
        case '#EXT-X-START': {
            line.value = startTag.parser(line.source);
            break;
        }
        case '#EXT-X-MEDIA': {
            line.value = parseMedia(line.source as any);
            break;
        }
        case '#EXT-X-STREAM-INF': {
            line.value = extXStreamInfParser(line.source as any);
            break;
        }
        case '#EXT-X-I-FRAME-STREAM-INF': {
            line.value = extXIFrameStreamInfParser(line.source as any);
            break;
        }
        case '#EXT-X-SESSION-DATA': {
            line.value = parseSessionData(line.source as any);
            break;
        }
        case '#EXT-X-SESSION-KEY': {
            line.value = parseSessionKey(line.source as any);
            break;
        }
    }
    return line;
}
