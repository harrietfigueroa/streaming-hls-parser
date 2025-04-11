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

        if (playlistToken) {
            this.push(playlistToken);
        }
        callback();
    }

    private parseValue(line: LexicalToken): PlaylistToken | LexicalToken {
        switch (line.type) {
            case HLSTag('#EXTM3U'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseExtendedM3U(line.source),
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
            case HLSTag('#EXT-X-INDEPENDENT-SEGMENTS'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseIndependentSegments(line.source as any),
                };
            }
            case HLSTag('#EXT-X-START'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseStart(line.source as any),
                };
            }
        }
        return line;
    }
}
