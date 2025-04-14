import { Transform } from 'node:stream';
import { TransformCallback } from 'stream';

export class NewlineTransformer extends Transform {
    constructor() {
        super({
            readableObjectMode: false,
            writableObjectMode: true,
            encoding: 'utf-8',
        });
    }
    private remainder: string = '';

    _transform(chunk: string, encoding: BufferEncoding, callback: TransformCallback): void {
        let line: string = '';

        const strChunk = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf-8');
        for (const char of this.remainder.concat(strChunk)) {
            if (char === '\n') {
                this.push(line, 'utf-8');
                line = '';
            } else if (char === ' ' || char === '\t' || char === '\r') {
                // Ignore whitespace
                continue;
            } else {
                line = line.concat(char);
            }
        }
        this.remainder = line;
        callback();
    }

    _final(callback: (error?: Error | null | undefined) => void): void {
        if (this.remainder) {
            this.push(Array.from(this.remainder).join(''), 'utf-8');
        }
        callback();
    }
}
