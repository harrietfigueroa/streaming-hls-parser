import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseByteRange from '../../hls/playlist-tags/media-segment-tags/EXT-X-BYTERANGE/parser';
import parseDateRange from '../../hls/playlist-tags/media-segment-tags/EXT-X-DATERANGE/parser';
import parseDiscontinuity from '../../hls/playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/parser';
import parseKey from '../../hls/playlist-tags/media-segment-tags/EXT-X-KEY/parser';
import parseMap from '../../hls/playlist-tags/media-segment-tags/EXT-X-MAP/parser';
import parseProgramDateTime from '../../hls/playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/parser';
import parseInf from '../../hls/playlist-tags/media-segment-tags/EXTINF/parser';
import { LexicalToken, MediaSegmentToken } from '../transformers.interfaces';

export class MediaSegmentIngestTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: LexicalToken, encoding: BufferEncoding, callback: TransformCallback): void {
        let mediaSegmentToken: any | null = this.parseValue(chunk);

        if (mediaSegmentToken) {
            this.push(mediaSegmentToken);
        }
        callback();
    }

    private parseValue(line: LexicalToken): MediaSegmentToken | LexicalToken {
        switch (line.type) {
            case HLSTag('#EXTINF'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseInf(line.source as any),
                };
            }
            case HLSTag('#EXT-X-BYTERANGE'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseByteRange(line.source as any),
                };
            }
            case HLSTag('#EXT-X-DISCONTINUITY'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseDiscontinuity(line.source),
                };
            }
            case HLSTag('#EXT-X-KEY'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseKey(line.source as any),
                };
            }
            case HLSTag('#EXT-X-MAP'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseMap(line.source as any),
                };
            }
            case HLSTag('#EXT-X-PROGRAM-DATE-TIME'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseProgramDateTime(line.source as any),
                };
            }
            case HLSTag('#EXT-X-DATERANGE'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseDateRange(line.source as any),
                };
            }
            case HLSTag('URI'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: line.source,
                };
            }
        }
        return line;
    }
}
