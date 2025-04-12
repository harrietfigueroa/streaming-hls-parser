import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseVersion from '../../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseExtendedM3U from '../../hls/playlist-tags/basic-tags/EXTM3U/parser';
import parseIndependentSegments from '../../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/parser';
import parseStart from '../../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/parser';
import parseIFrameStreamInf from '../../hls/playlist-tags/multivariant-playlist-tags/EXT-X-I-FRAME-STREAM-INF/parser';
import parseMedia from '../../hls/playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/parser';
import parseSessionData from '../../hls/playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/parser';
import parseSessionKey from '../../hls/playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/parser';
import parseStreamInf from '../../hls/playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/parser';
import { LexicalToken } from '../transformers.interfaces';

export class MultivariantPlaylistIngestTransformer extends Transform {
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

    private parseValue(line: LexicalToken): LexicalToken {
        switch (line.type) {
            case HLSTag('#EXTM3U'): {
                return {
                    ...line,
                    value: parseExtendedM3U(line.source),
                };
            }
            case HLSTag('#EXT-X-VERSION'): {
                return {
                    ...line,
                    value: parseVersion(line.source),
                };
            }
            case HLSTag('#EXT-X-MEDIA'): {
                return {
                    ...line,
                    value: parseMedia(line.source as any),
                };
            }
            case HLSTag('#EXT-X-STREAM-INF'): {
                return {
                    ...line,
                    value: parseStreamInf(line.source as any),
                };
            }
            case HLSTag('#EXT-X-I-FRAME-STREAM-INF'): {
                return {
                    ...line,
                    value: parseIFrameStreamInf(line.source as any),
                };
            }
            case HLSTag('#EXT-X-SESSION-DATA'): {
                return {
                    ...line,
                    value: parseSessionData(line.source as any),
                };
            }
            case HLSTag('#EXT-X-SESSION-KEY'): {
                return {
                    ...line,
                    value: parseSessionKey(line.source as any),
                };
            }
            case HLSTag('#EXT-X-INDEPENDENT-SEGMENTS'): {
                return {
                    ...line,
                    value: parseIndependentSegments(line.source as any),
                };
            }
            case HLSTag('#EXT-X-START'): {
                return {
                    ...line,
                    value: parseStart(line.source as any),
                };
            }
        }
        return line;
    }
}
