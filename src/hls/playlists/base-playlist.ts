import { pipeline, Readable } from 'node:stream';
import { HlsLexicalTransformer } from '../../transformers/hls-lexical.transformer';
import { NewlineTransformer } from '../../transformers/newline.transformer';
import { MultivariantOrMediaPlaylistIngestTransformer } from '../../transformers/multivariant-or-media-playlist/multivariant-or-media-playlist.ingest.transformer';
import { BasicPlaylistIngestTransformer } from '../../transformers/basic-tags/basic-tags.ingest.transformer';

export class BasePlaylist<T = unknown> extends Map<string, T> {
    protected static createTokenizedStream<Input extends Iterable<string> | AsyncIterable<string>>(
        source: Input,
    ): Readable {
        return Readable.from(source)
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new BasicPlaylistIngestTransformer())
            .pipe(new MultivariantOrMediaPlaylistIngestTransformer());
    }
}
