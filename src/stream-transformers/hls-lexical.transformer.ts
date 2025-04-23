import { Transform, TransformCallback } from 'stream';
import { tokenizeLine } from '../parser/tokenize-line';

export class HlsLexicalTransformer extends Transform {
    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        this.push(tokenizeLine(chunk));
        callback();
    }
}
