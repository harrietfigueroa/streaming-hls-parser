import { Transform, TransformCallback } from 'stream';
import { URI } from '../hls/hls.enums';
import { isUri } from '../hls/isUri';
import { tagToSymbol } from '../hls/tagToSymbol';

export class HlsLexicalTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        const workingChunk: string = Buffer.from(chunk).toString();

        let lexicalParsed: Lexical | null = this.parseLexical(workingChunk);

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

export interface Lexical {
    type: Symbol;
    value: unknown;
}
