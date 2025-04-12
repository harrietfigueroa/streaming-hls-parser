import { Transform, TransformCallback } from 'stream';
import HLSTag from '../../hls/hls-tag';
import parseVersion from '../../hls/playlist-tags/basic-tags/EXT-X-VERSION/parser';
import parseExtendedM3U from '../../hls/playlist-tags/basic-tags/EXTM3U/parser';
import { LexicalToken } from '../transformers.interfaces';

export class BasicPlaylistIngestTransformer extends Transform {
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
            case HLSTag('#EXTM3U'): {
                line.value = parseExtendedM3U(line.source);
                break;
            }
            case HLSTag('#EXT-X-VERSION'): {
                line.value = parseVersion(line.source);
                break;
            }
        }
        return line;
    }
}
