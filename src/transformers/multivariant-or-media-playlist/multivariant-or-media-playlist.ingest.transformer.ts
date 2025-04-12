import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseIndependentSegments from '../../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/parser';
import parseStart from '../../hls/playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/parser';
import { LexicalToken } from '../transformers.interfaces';

export class MultivariantOrMediaPlaylistIngestTransformer extends Transform {
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

    private parseValue(line: LexicalToken): LexicalToken {
        switch (line.type) {
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
