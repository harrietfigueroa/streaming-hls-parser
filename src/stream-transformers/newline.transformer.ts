import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { TransformCallback } from 'stream';

export class NewlineTransformer extends Transform {
    private stringDecoder: StringDecoder = new StringDecoder('utf-8');
    private remainder: string = '';

    constructor() {
        super({
            objectMode: true,
            encoding: 'utf-8',
        });
    }

    _transform(chunk: string, encoding: BufferEncoding, callback: TransformCallback): void {
        const workingChunk = this.stringDecoder.end(chunk);

        const lines = (this.remainder + workingChunk).split('\n');

        if (lines.length === 1) {
            // If there's only one line then send it off and blank the remainder
            this.push(lines[0]);
            this.remainder = '';
            callback();
            return;
        }

        // Pop off the last line, which may be incomplete
        this.remainder = lines.pop()!;

        for (const line of lines) {
            this.push(line);
        }
        callback();
    }

    _flush(callback: (error?: Error | null | undefined) => void): void {
        if (this.remainder) {
            this.push(this.remainder);
        }
        callback();
    }
}
