import { Transform, TransformCallback } from 'stream';
import parseExtendedM3U from '../../hls/playlist-tags/basic-tags/EXTM3U/parser';
import parseVersion from '../../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseMediaSequence from '../../hls/playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/parser';
import parseTargetDuration from '../../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseDiscontinuitySequence from '../../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseIndependentSegments from '../../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/parser';
import parseEndlist from '../../hls/playlist-tags/media-playlist-tags/EXT-X-ENDLIST/parser';
import parsePlaylistType from '../../hls/playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/parser';
import parseIFramesOnly from '../../hls/playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/parser';
import parseStart from '../../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/parser';
import { LexicalToken, PlaylistToken } from '../transformers.interfaces';
import HLSTag from '../../hls/hls-tag';

export class MediaPlaylistIngestTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: LexicalToken, encoding: BufferEncoding, callback: TransformCallback): void {
        let playlistToken: LexicalToken = this.parseValue(chunk);

        this.push(playlistToken);
        callback();
    }

    private parseValue(line: LexicalToken): LexicalToken {
        switch (line.type) {
            case HLSTag('#EXTM3U'): {
                line.value = parseExtendedM3U(line.source);
                break;
            }
            case HLSTag('#EXT-X-VERSION'): {
                line.value = parseVersion(line.source);
                break;
            }
            case HLSTag('#EXT-X-TARGETDURATION'): {
                line.value = parseTargetDuration(line.source);
                break;
            }
            case HLSTag('#EXT-X-MEDIA-SEQUENCE'): {
                line.value = parseMediaSequence(line.source);
                break;
            }
            case HLSTag('#EXT-X-DISCONTINUITY-SEQUENCE'): {
                line.value = parseDiscontinuitySequence(line.source);
                break;
            }
            case HLSTag('#EXT-X-ENDLIST'): {
                line.value = parseEndlist(line.source);
                break;
            }
            case HLSTag('#EXT-X-PLAYLIST-TYPE'): {
                line.value = parsePlaylistType(line.source);
                break;
            }
            case HLSTag('#EXT-X-I-FRAMES-ONLY'): {
                line.value = parseIFramesOnly(line.source);
                break;
            }
            case HLSTag('#EXT-X-INDEPENDENT-SEGMENTS'): {
                line.value = parseIndependentSegments(line.source);
                break;
            }
            case HLSTag('#EXT-X-START'): {
                line.value = parseStart(line.source);
                break;
            }
        }
        return line;
    }
}
