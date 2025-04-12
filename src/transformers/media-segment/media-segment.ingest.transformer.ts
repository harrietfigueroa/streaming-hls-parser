import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseByteRange from '../../hls/playlist-tags/media-segment-tags/EXT-X-BYTERANGE/parser';
import parseDateRange from '../../hls/playlist-tags/media-segment-tags/EXT-X-DATERANGE/parser';
import parseDiscontinuity from '../../hls/playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/parser';
import parseKey from '../../hls/playlist-tags/media-segment-tags/EXT-X-KEY/parser';
import parseMap from '../../hls/playlist-tags/media-segment-tags/EXT-X-MAP/parser';
import parseProgramDateTime from '../../hls/playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/parser';
import parseInf from '../../hls/playlist-tags/media-segment-tags/EXTINF/parser';
import { LexicalToken } from '../transformers.interfaces';

export class MediaSegmentIngestTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: LexicalToken, encoding: BufferEncoding, callback: TransformCallback): void {
        let mediaSegmentToken: LexicalToken = this.parseValue(chunk);

        this.push(mediaSegmentToken);
        callback();
    }

    private parseValue(line: LexicalToken): LexicalToken {
        switch (line.type) {
            case HLSTag('#EXTINF'): {
                line.value = parseInf(line.source as any);
                break;
            }
            case HLSTag('URI'): {
                line.value = line.source;
                break;
            }
            case HLSTag('#EXT-X-BYTERANGE'): {
                line.value = parseByteRange(line.source as any);
                break;
            }
            case HLSTag('#EXT-X-DISCONTINUITY'): {
                line.value = parseDiscontinuity(line.source as any);
                break;
            }
            case HLSTag('#EXT-X-KEY'): {
                line.value = parseKey(line.source as any);
                break;
            }
            case HLSTag('#EXT-X-MAP'): {
                line.value = parseMap(line.source as any);
                break;
            }
            case HLSTag('#EXT-X-PROGRAM-DATE-TIME'): {
                line.value = parseProgramDateTime(line.source as any);
                break;
            }
            case HLSTag('#EXT-X-DATERANGE'): {
                line.value = parseDateRange(line.source as any);
                break;
            }
        }
        return line;
    }
}
