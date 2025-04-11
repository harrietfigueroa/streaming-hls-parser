import { Transform } from 'node:stream';
import { TransformCallback } from 'stream';

export class NewlineTransformer extends Transform {
    constructor() {
        super({ objectMode: true });
    }
    private remainder: string = '';
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        let workingChunk: string = this.remainder + Buffer.from(chunk).toString().trimStart();
        let newLineIndex: number;

        // We want to include the newline, so + 1
        while ((newLineIndex = workingChunk.indexOf('\n') + 1)) {
            // Grab the bit up to the new line
            const splitChunk: string = workingChunk.slice(0, newLineIndex);
            // Push it out to consumers
            this.push(splitChunk.trimEnd());
            // Remove the part of the workingChunk we just used
            workingChunk = workingChunk.slice(newLineIndex).trimStart();
        }

        this.remainder = workingChunk;

        callback();
    }

    _final(callback: (error?: Error | null | undefined) => void): void {
        if (this.remainder) {
            this.push(this.remainder);
        }
        callback();
    }
}
