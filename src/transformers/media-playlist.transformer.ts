import { Transform, TransformCallback } from 'stream';
import parseExtendedM3U from '../hls/playlist-tags/basic-tags/EXTM3U/parser';
import parseVersion from '../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseMediaSequence from '../hls/playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/parser';
import parseTargetDuration from '../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseDiscontinuitySequence from '../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseEndlist from '../hls/playlist-tags/media-playlist-tags/EXT-ENDLIST/parser';
import parsePlaylistType from '../hls/playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/parser';
import parseIFramesOnly from '../hls/playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/parser';
import { Lexical } from './transformers.interfaces';
import HLSTag from '../hls/hls-tag';

export class MediaPlaylistTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: Lexical, encoding: BufferEncoding, callback: TransformCallback): void {
        let mediaPlaylistToken: any | null = this.parseValue(chunk);

        if (mediaPlaylistToken) {
            this.push(mediaPlaylistToken);
        }
        callback();
    }

    private parseValue(line: Lexical): any | null {
        if (line.type === HLSTag('URI')) {
            return {
                type: line.type,
                source: line.source,
                value: line.source,
            };
        }

        switch (line.type) {
            case HLSTag('#EXTM3U'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseExtendedM3U(),
                };
            }
            case HLSTag('#EXT-X-VERSION'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseVersion(line.source),
                };
            }
            case HLSTag('#EXT-X-TARGETDURATION'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseTargetDuration(line.source as any),
                };
            }
            case HLSTag('#EXT-X-MEDIA-SEQUENCE'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseMediaSequence(line.source as any),
                };
            }
            case HLSTag('#EXT-X-DISCONTINUITY-SEQUENCE'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseDiscontinuitySequence(line.source as any),
                };
            }
            case HLSTag('#EXT-X-ENDLIST'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseEndlist(line.source as any),
                };
            }
            case HLSTag('#EXT-X-PLAYLIST-TYPE'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parsePlaylistType(line.source as any),
                };
            }
            case HLSTag('#EXT-X-I-FRAMES-ONLY'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseIFramesOnly(line.source as any),
                };
            }
        }
        return null;
    }
}
