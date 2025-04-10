import { Transform, TransformCallback } from 'stream';
import HLSTag from '../hls/hls-tag';
import { isUri } from '../hls/isUri';
import { Lexical } from './transformers.interfaces';
import { PLAYLIST_TAGS } from '../hls/hls.types';

export class HlsLexicalTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        let lexicalParsed: Lexical | null = this.parseLexical(chunk);

        if (lexicalParsed) {
            this.push(lexicalParsed);
        }
        callback();
    }

    private parseLexical(line: string): Lexical {
        if (isUri(line)) {
            return {
                type: HLSTag('URI'),
                source: line,
            };
        }

        // Casting is safe here because any unknown tag, custom tags for example,
        // will be added to the global symbol registry
        const tagSymbol: symbol = HLSTag(line as PLAYLIST_TAGS);
        return {
            type: tagSymbol,
            source: line,
        };
    }
}
