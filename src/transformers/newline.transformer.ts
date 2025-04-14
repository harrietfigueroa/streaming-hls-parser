import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { TransformCallback } from 'stream';

export class NewlineTransformer extends Transform {
    private stringDecoder = new StringDecoder('utf-8');

    constructor() {
        super({
            objectMode: true,
            encoding: 'utf-8',
        });
    }
    private finalString: string = '';

    _transform(chunk: string, encoding: BufferEncoding, callback: TransformCallback): void {
        this.finalString += this.stringDecoder.write(chunk);
        callback();
    }

    _flush(callback: (error?: Error | null | undefined) => void): void {
        let sliceStart = 0;
        let sliceEnd = this.finalString.indexOf('\n', sliceStart);
        for (
            ;
            sliceEnd !== -1;
            sliceStart = sliceEnd + 1, sliceEnd = this.finalString.indexOf('\n', sliceStart)
        ) {
            const lastLine = this.finalString.slice(sliceStart, sliceEnd);
            this.push(lastLine);
        }
        this.push(this.finalString.slice(sliceStart));
        callback();
    }
}
