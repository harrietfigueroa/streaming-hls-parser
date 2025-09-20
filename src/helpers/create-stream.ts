import { HlsLexicalTransformer } from "../stream-transformers/hls-lexical.transformer";
import { HlsParseTransformer } from "../stream-transformers/hls-parse.transformer";
import { NewlineTransformer } from "../stream-transformers/newline.transformer";
import { Readable } from 'node:stream';

export function createStream<
    Input extends Iterable<string> | AsyncIterable<string | Uint8Array>,
>(source: Input): Readable {
    return Readable.from(source)
        .pipe(new NewlineTransformer())
        .pipe(new HlsLexicalTransformer())
        .pipe(new HlsParseTransformer());
}