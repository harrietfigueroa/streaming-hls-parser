import { Transform, TransformCallback } from 'stream';
import { parseTokenizedLine } from '../parser/parse-tokenized-line';
import { LexicalToken } from '../parser/parser.interfaces';

export class HlsParseTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: LexicalToken, encoding: BufferEncoding, callback: TransformCallback): void {
        let parsedToken: any | null = parseTokenizedLine(chunk);

        if (parsedToken) {
            this.push(parsedToken);
        }

        callback();
    }
}
