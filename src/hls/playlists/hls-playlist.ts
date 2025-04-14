import { Readable } from 'node:stream';
import { HlsLexicalTransformer } from '../../transformers/hls-lexical.transformer';
import { NewlineTransformer } from '../../transformers/newline.transformer';
import { MultivariantOrMediaPlaylistIngestTransformer } from '../../transformers/multivariant-or-media-playlist/multivariant-or-media-playlist.ingest.transformer';
import { BasicPlaylistIngestTransformer } from '../../transformers/basic-tags/basic-tags.ingest.transformer';
import { HLSObject } from './hls-object';

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

    protected static createTokenizedStream<
        Input extends Iterable<string> | AsyncIterable<string | Uint8Array>,
    >(source: Input): Readable {
        return Readable.from(source)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new BasicPlaylistIngestTransformer())
            .pipe(new MultivariantOrMediaPlaylistIngestTransformer());
    }
}
