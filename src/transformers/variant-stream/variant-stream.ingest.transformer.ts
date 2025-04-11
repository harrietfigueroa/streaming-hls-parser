import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseStreamInf from '../../hls/playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/parser';
import { LexicalToken, MediaSegmentToken } from '../transformers.interfaces';

export class VariantStreamIngestTransformer extends Transform {
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
            case HLSTag('#EXT-X-STREAM-INF'): {
                return {
                    type: line.type,
                    source: line.source,
                    value: parseStreamInf(line.source as any),
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
