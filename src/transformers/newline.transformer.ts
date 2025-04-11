import { pipeline, Readable, Transform } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { StringDecoder } from 'node:string_decoder';
import { TransformCallback } from 'stream';

function* charItr(previous: Iterable<string>, next: Iterable<string>) {
    yield* previous;
    yield* next;
}

export class NewlineTransformer extends Transform {
    constructor() {
        super({
            readableObjectMode: false,
            writableObjectMode: true,
            encoding: 'utf-8',
        });
    }
    private remainder: Iterable<string> = [];

    _transform(chunk: string, encoding: BufferEncoding, callback: TransformCallback): void {
        const itr: Iterable<string> = charItr(this.remainder, chunk);
        let line: string = '';

        for (const char of itr) {
            if (char === '\n') {
                this.push(line, 'utf-8');
                line = '';
            } else if (char === ' ' || char === '\t' || char === '\r') {
                // Ignore whitespace
                continue;
            } else {
                line = line + char;
            }
        }
        this.remainder = line;
        callback();

        // // We want to include the newline, so + 1
        // while ((newLineIndex = workingChunk.indexOf('\n') + 1)) {
        //     // Grab the bit up to the new line
        //     const splitChunk: string = workingChunk.slice(0, newLineIndex);
        // let newLineIndex: number;

        // // We want to include the newline, so + 1
        // while ((newLineIndex = workingChunk.indexOf('\n') + 1)) {
        //     // Grab the bit up to the new line
        //     const splitChunk: string = workingChunk.slice(0, newLineIndex);
        //     // Push it out to consumers
        //     this.push(splitChunk.trimEnd());
        //     // Remove the part of the workingChunk we just used
        //     workingChunk = workingChunk.slice(newLineIndex).trimStart();
        // }

        // this.remainder = workingChunk;

        // callback();
    }

    _final(callback: (error?: Error | null | undefined) => void): void {
        if (this.remainder) {
            this.push(Array.from(this.remainder).join(''), 'utf-8');
        }
        callback();
    }
}
