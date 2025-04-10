import { Transform, TransformCallback } from 'stream';
import { URI } from '../hls/hls.constants';
import { isUri } from '../hls/isUri';
import { tagToSymbol } from '../hls/tagToSymbol';
import { Lexical } from './transformers.interfaces';

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

    private parseLexical(line: string): Lexical | null {
        if (isUri(line)) {
            return {
                type: URI,
                value: line,
            };
        }
        const tagSymbol: symbol | null = tagToSymbol(line);
        if (tagSymbol) {
            return {
                type: tagSymbol,
                value: line,
            };
        }
        return null;
    }
}
