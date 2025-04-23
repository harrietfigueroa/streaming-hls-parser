import { Readable } from 'node:stream';
import { HlsLexicalTransformer } from '../../stream-transformers/hls-lexical.transformer';
import { NewlineTransformer } from '../../stream-transformers/newline.transformer';
import { HLSObject } from './hls-object';
import { HlsParseTransformer } from '../../stream-transformers/hls-parse.transformer';

export abstract class HLSPlaylist<ChildHLSProperties> extends Map<
    string,
    HLSObject<ChildHLSProperties> & ChildHLSProperties
> {
    protected error?: Error;

    // protected childErrors(): Error[] {
    //     const errors: Error[] = [];
    //     for (const [key, value] of this) {
    //         if (value?.error instanceof Error) {
    //             errors.push(value.error);
    //         }
    //     }
    // }

    protected *childHLSValues(): Iterable<string> {
        for (const value of this.values()) {
            yield* value.toHLSLines();
        }
    }

    protected *childJSONValues(): Iterable<ChildHLSProperties> {
        for (const value of this.values()) {
            yield value.toJSON();
        }
    }

    protected static createStream<
        Input extends Iterable<string> | AsyncIterable<string | Uint8Array>,
    >(source: Input): Readable {
        return Readable.from(source)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new HlsParseTransformer());
    }
}
