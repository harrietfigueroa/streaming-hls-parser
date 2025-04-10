import { Transform, TransformCallback } from 'stream';
import { HLS_TAG_TYPES, URI } from '../hls/hls.constants';
import parseExtendedM3U from '../hls/playlist-tags/basic-tags/EXTM3U/parser';
import parseVersion from '../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseMediaSequence from '../hls/playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/parser';
import parseTargetDuration from '../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseDiscontinuitySequence from '../hls/playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/parser';
import parseEndlist from '../hls/playlist-tags/media-playlist-tags/EXT-ENDLIST/parser';
import parsePlaylistType from '../hls/playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/parser';
import parseIFramesOnly from '../hls/playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/parser';
import { Lexical, MediaPlaylistLine } from './transformers.interfaces';

export class MediaPlaylistTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: Lexical, encoding: BufferEncoding, callback: TransformCallback): void {
        let mediaPlaylistToken: MediaPlaylistLine | null = this.parseValue(chunk);

        if (mediaPlaylistToken) {
            this.push(mediaPlaylistToken);
        }
        callback();
    }

    private parseValue(line: Lexical): MediaPlaylistLine | null {
        if (line.type === URI) {
            return {
                type: line.type,
                source: line.value,
                value: line.value,
            };
        }

        switch (line.type) {
            case HLS_TAG_TYPES['#EXTM3U']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseExtendedM3U(),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-VERSION']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseVersion(line.value),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-TARGETDURATION']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseTargetDuration(line.value as any),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-MEDIA-SEQUENCE']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseMediaSequence(line.value as any),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-DISCONTINUITY-SEQUENCE']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseDiscontinuitySequence(line.value as any),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-ENDLIST']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseEndlist(line.value as any),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-PLAYLIST-TYPE']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parsePlaylistType(line.value as any),
                };
            }
            case HLS_TAG_TYPES['#EXT-X-I-FRAMES-ONLY']: {
                return {
                    type: line.type,
                    source: line.value,
                    value: parseIFramesOnly(line.value as any),
                };
            }
        }
        return null;
    }
}
