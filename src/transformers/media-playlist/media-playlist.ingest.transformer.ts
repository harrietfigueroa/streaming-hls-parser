import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseVersion from '../../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseExtendedM3U from '../../hls/playlist-tags/basic-tags/EXTM3U/parser';
import parseEndlist from '../../hls/playlist-tags/media-playlist-tags/EXT-X-ENDLIST/parser';
import parseIFramesOnly from '../../hls/playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/parser';
import parseMediaSequence from '../../hls/playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/parser';
import parsePlaylistType from '../../hls/playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/parser';
import {
    default as parseDiscontinuitySequence,
    default as parseTargetDuration,
} from '../../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import { LexicalToken } from '../transformers.interfaces';

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
        }
        return line;
    }
}
