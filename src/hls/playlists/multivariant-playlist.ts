import * as z from 'zod';
import { createStream } from '../../helpers/create-stream';
import { parseTokenizedLine } from '../../parser/parse-tokenized-line';
import { LexicalToken, Reviver } from '../../parser/parser.interfaces';
import { tokenizeLine } from '../../parser/tokenize-line';
import {
    Replacer,
    FormatOptions,
    isValueReplacer,
    isStringReplacer,
} from '../hlsifier/hlsifier.interfaces';
import { EXTM3U_CODEC } from '../playlist-tags/basic-tags/EXTM3U/schema';
import { EXT_X_VERSION_CODEC } from '../playlist-tags/basic-tags/EXT-X-VERSION/schema';
import { EXT_X_INDEPENDENT_SEGMENTS_CODEC } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/schema';
import { EXT_X_START_CODEC } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/schema';
import { EXT_X_DEFINE_CODEC } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-DEFINE/schema';
import { EXT_X_MEDIA_CODEC } from '../playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/schema';
import { EXT_X_SESSION_DATA_CODEC } from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/schema';
import { EXT_X_SESSION_KEY_CODEC } from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/schema';
import { EXT_X_CONTENT_STEERING_CODEC } from '../playlist-tags/multivariant-playlist-tags/EXT-X-CONTENT-STEERING/schema';
import { StreamInf } from './stream-inf';
import { StreamInfArrayBuilder } from './stream-inf-array-builder';
import { Playlist } from './playlists.interfaces';

export interface MultivariantPlaylistOptions {
    '#EXTM3U': z.infer<typeof EXTM3U_CODEC>;
    '#EXT-X-VERSION'?: z.infer<typeof EXT_X_VERSION_CODEC>;
    '#EXT-X-MEDIA'?: z.infer<typeof EXT_X_MEDIA_CODEC>;
    '#EXT-X-SESSION-DATA'?: z.infer<typeof EXT_X_SESSION_DATA_CODEC>;
    '#EXT-X-SESSION-KEY'?: z.infer<typeof EXT_X_SESSION_KEY_CODEC>;
    '#EXT-X-INDEPENDENT-SEGMENTS'?: z.infer<typeof EXT_X_INDEPENDENT_SEGMENTS_CODEC>;
    '#EXT-X-START'?: z.infer<typeof EXT_X_START_CODEC>;
    '#EXT-X-DEFINE'?: z.infer<typeof EXT_X_DEFINE_CODEC>;
    '#EXT-X-CONTENT-STEERING'?: z.infer<typeof EXT_X_CONTENT_STEERING_CODEC>;
}

export class MultivariantPlaylist extends Map<string, StreamInf> implements Playlist {
    /**
     * The EXTM3U tag indicates that the file is an Extended M3U [M3U]
     Playlist file.  It MUST be the first line of every Media Playlist and
    every Master Playlist.  Its format is:

    #EXTM3U
    */
    public readonly '#EXTM3U': MultivariantPlaylistOptions['#EXTM3U'];

    /**
     * The EXT-X-VERSION tag indicates the compatibility version of the
     Playlist file, its associated media, and its server.

    The EXT-X-VERSION tag applies to the entire Playlist file.  Its
    format is:

    #EXT-X-VERSION:<n>

    where n is an integer indicating the protocol compatibility version
    number.
    */
    public readonly '#EXT-X-VERSION': MultivariantPlaylistOptions['#EXT-X-VERSION'];

    /**
    * The EXT-X-MEDIA tag is used to relate Media Playlists that contain
    alternative Renditions (Section 4.3.4.2.1) of the same content.  For
    example, three EXT-X-MEDIA tags can be used to identify audio-only
    Media Playlists that contain English, French, and Spanish Renditions
    of the same presentation.  Or, two EXT-X-MEDIA tags can be used to
    identify video-only Media Playlists that show two different camera
    angles.

    Its format is:

    #EXT-X-MEDIA:<attribute-list>
    */
    public readonly '#EXT-X-MEDIA': MultivariantPlaylistOptions['#EXT-X-MEDIA'];

    /**
     * The EXT-X-SESSION-DATA tag allows arbitrary session data to be
     carried in a Master Playlist.

    Its format is:

    #EXT-X-SESSION-DATA:<attribute-list>
    */
    public readonly '#EXT-X-SESSION-DATA': MultivariantPlaylistOptions['#EXT-X-SESSION-DATA'];

    /**
 * The EXT-X-SESSION-KEY tag allows encryption keys from Media Playlists
   to be specified in a Master Playlist.  This allows the client to
   preload these keys without having to read the Media Playlist(s)
   first.

   Its format is:

   #EXT-X-SESSION-KEY:<attribute-list>

   All attributes defined for the EXT-X-KEY tag (Section 4.3.2.4) are
   also defined for the EXT-X-SESSION-KEY, except that the value of the
   METHOD attribute MUST NOT be NONE.  If an EXT-X-SESSION-KEY is used,
   the values of the METHOD, KEYFORMAT, and KEYFORMATVERSIONS attributes
   MUST match any EXT-X-KEY with the same URI value.

   EXT-X-SESSION-KEY tags SHOULD be added if multiple Variant Streams or
   Renditions use the same encryption keys and formats.  An EXT-X-
   SESSION-KEY tag is not associated with any particular Media Playlist.

   A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY
   tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS
   attribute values.

   The EXT-X-SESSION-KEY tag is optional.
 */
    public readonly '#EXT-X-SESSION-KEY': MultivariantPlaylistOptions['#EXT-X-SESSION-KEY'];

    /**
     * The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples
     in a Media Segment can be decoded without information from other
    segments.  It applies to every Media Segment in the Playlist.

    Its format is:

    #EXT-X-INDEPENDENT-SEGMENTS
    */
    public readonly '#EXT-X-INDEPENDENT-SEGMENTS': MultivariantPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];

    /**
     * The EXT-X-START tag indicates a preferred point at which to start
     playing a Playlist.  By default, clients SHOULD start playback at
    this point when beginning a playback session.  This tag is OPTIONAL.

    Its format is:

    #EXT-X-START:<attribute-list>

    The following attributes are defined:

        TIME-OFFSET

        The value of TIME-OFFSET is a signed-decimal-floating-point number
        of seconds.  A positive number indicates a time offset from the
        beginning of the Playlist.  A negative number indicates a negative
        time offset from the end of the last Media Segment in the
        Playlist.  This attribute is REQUIRED.

        The absolute value of TIME-OFFSET SHOULD NOT be larger than the
        Playlist duration.  If the absolute value of TIME-OFFSET exceeds
        the duration of the Playlist, it indicates either the end of the
        Playlist (if positive) or the beginning of the Playlist (if
        negative).

        If the Playlist does not contain the EXT-X-ENDLIST tag, the TIME-
        OFFSET SHOULD NOT be within three target durations of the end of
        the Playlist file.

        PRECISE

        The value is an enumerated-string; valid strings are YES and NO.
        If the value is YES, clients SHOULD start playback at the Media
        Segment containing the TIME-OFFSET, but SHOULD NOT render media
        samples in that segment whose presentation times are prior to the
        TIME-OFFSET.  If the value is NO, clients SHOULD attempt to render
        every media sample in that segment.  This attribute is OPTIONAL.
        If it is missing, its value should be treated as NO.
    */
    public readonly '#EXT-X-START': MultivariantPlaylistOptions['#EXT-X-START'];

    /**
     * The EXT-X-DEFINE tag allows variable definitions that can be referenced
     * throughout the playlist using variable substitution. Variables can be
     * defined explicitly with NAME/VALUE pairs or imported from query parameters.
     *
     * Its format is:
     *
     * #EXT-X-DEFINE:<attribute-list>
     *
     * Attributes: NAME, VALUE, IMPORT, QUERYPARAM
     */
    public readonly '#EXT-X-DEFINE': MultivariantPlaylistOptions['#EXT-X-DEFINE'];

    /**
     * The EXT-X-CONTENT-STEERING tag allows the server to provide a Content
     * Steering Manifest that describes alternate pathways for delivering content.
     * This enables dynamic CDN switching based on network conditions.
     *
     * Its format is:
     *
     * #EXT-X-CONTENT-STEERING:<attribute-list>
     *
     * Attributes include SERVER-URI and PATHWAY-ID.
     */
    public readonly '#EXT-X-CONTENT-STEERING': MultivariantPlaylistOptions['#EXT-X-CONTENT-STEERING'];

    private constructor(
        multivariantPlaylistOptions: MultivariantPlaylistOptions,
        variantStreams: Map<string, StreamInf>,
    ) {
        super(variantStreams);

        this['#EXTM3U'] = multivariantPlaylistOptions['#EXTM3U'];
        this['#EXT-X-VERSION'] = multivariantPlaylistOptions['#EXT-X-VERSION'];
        this['#EXT-X-MEDIA'] = multivariantPlaylistOptions['#EXT-X-MEDIA'];
        this['#EXT-X-SESSION-DATA'] = multivariantPlaylistOptions['#EXT-X-SESSION-DATA'];
        this['#EXT-X-SESSION-KEY'] = multivariantPlaylistOptions['#EXT-X-SESSION-KEY'];
        this['#EXT-X-INDEPENDENT-SEGMENTS'] =
            multivariantPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];
        this['#EXT-X-START'] = multivariantPlaylistOptions['#EXT-X-START'];
        this['#EXT-X-DEFINE'] = multivariantPlaylistOptions['#EXT-X-DEFINE'];
        this['#EXT-X-CONTENT-STEERING'] = multivariantPlaylistOptions['#EXT-X-CONTENT-STEERING'];
    }

    private static buildPlaylistOptions(
        token: LexicalToken,
        multivariantPlaylistOptions: Partial<MultivariantPlaylistOptions>,
    ): Partial<MultivariantPlaylistOptions> {
        switch (token.type) {
            case '#EXTM3U': {
                multivariantPlaylistOptions['#EXTM3U'] = token.value as any;
                break;
            }
            case '#EXT-X-VERSION': {
                multivariantPlaylistOptions['#EXT-X-VERSION'] = token.value as any;
                break;
            }
            case '#EXT-X-MEDIA': {
                multivariantPlaylistOptions['#EXT-X-MEDIA'] = token.value as any;
                break;
            }
            case '#EXT-X-SESSION-DATA': {
                multivariantPlaylistOptions['#EXT-X-SESSION-DATA'] = token.value as any;
                break;
            }
            case '#EXT-X-SESSION-KEY': {
                multivariantPlaylistOptions['#EXT-X-SESSION-KEY'] = token.value as any;
                break;
            }
            case '#EXT-X-INDEPENDENT-SEGMENTS': {
                multivariantPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'] = token.value as any;
                break;
            }
            case '#EXT-X-START': {
                multivariantPlaylistOptions['#EXT-X-START'] = token.value as any;
                break;
            }
            case '#EXT-X-DEFINE': {
                multivariantPlaylistOptions['#EXT-X-DEFINE'] = token.value as any;
                break;
            }
            case '#EXT-X-CONTENT-STEERING': {
                multivariantPlaylistOptions['#EXT-X-CONTENT-STEERING'] = token.value as any;
                break;
            }
        }
        return multivariantPlaylistOptions;
    }

    private static buildVariantStreams(
        token: LexicalToken,
        variantStreamsArrayBuilder: StreamInfArrayBuilder,
    ): StreamInfArrayBuilder {
        switch (token.type) {
            case '#EXT-X-STREAM-INF': {
                variantStreamsArrayBuilder.addStreamInf(token.value as any);
                break;
            }
            case 'URI': {
                variantStreamsArrayBuilder.addURI(token.value as any);
                break;
            }
        }
        return variantStreamsArrayBuilder;
    }

    public static fromString(input: string, reviver?: Reviver): MultivariantPlaylist {
        const multivariantPlaylistOptions: Partial<MultivariantPlaylistOptions> = {};
        const variantStreamsArrayBuilder = new StreamInfArrayBuilder();

        let parsingStreamVariants: boolean = false;

        for (const line of input.split('\n')) {
            let token = parseTokenizedLine(tokenizeLine(line));

            if (reviver) {
                token = reviver(token);
            }

            if (parsingStreamVariants === false) {
                MultivariantPlaylist.buildPlaylistOptions(token, multivariantPlaylistOptions);
                if (token.type === '#EXT-X-STREAM-INF') {
                    parsingStreamVariants = true;
                }
            }

            if (parsingStreamVariants) {
                MultivariantPlaylist.buildVariantStreams(token, variantStreamsArrayBuilder);
            }
        }

        return new MultivariantPlaylist(
            multivariantPlaylistOptions as MultivariantPlaylistOptions,
            variantStreamsArrayBuilder,
        );
    }

    public static async fromStream<Input extends Iterable<string> | AsyncIterable<string>>(
        source: Input,
        reviver?: Reviver,
    ): Promise<MultivariantPlaylist> {
        const tokenizedStream: AsyncIterable<LexicalToken> = createStream(source);

        const multivariantPlaylistOptions: Partial<MultivariantPlaylistOptions> = {};
        const variantStreamsArrayBuilder = new StreamInfArrayBuilder();

        let parsingStreamVariants: boolean = false;
        for await (let token of tokenizedStream) {
            if (reviver) {
                token = reviver(token);
            }
            if (parsingStreamVariants === false) {
                MultivariantPlaylist.buildPlaylistOptions(token, multivariantPlaylistOptions);
                if (token.type === '#EXT-X-STREAM-INF') {
                    parsingStreamVariants = true;
                }
            }

            if (parsingStreamVariants) {
                MultivariantPlaylist.buildVariantStreams(token, variantStreamsArrayBuilder);
            }
        }

        return new MultivariantPlaylist(
            multivariantPlaylistOptions as MultivariantPlaylistOptions,
            variantStreamsArrayBuilder,
        );
    }

    public static clone(playlist: MultivariantPlaylist): MultivariantPlaylist {
        return MultivariantPlaylist.fromString(playlist.toHLS());
    }

    public static isMultivariantPlaylist(input: string): boolean {
        return (
            input.includes('#EXT-X-MEDIA') ||
            input.includes('#EXT-X-STREAM-INF') ||
            input.includes('EXT-X-I-FRAME-STREAM-INF')
        );
    }

    public *toHLSLines(): Iterable<string> {
        yield EXTM3U_CODEC.encode(this['#EXTM3U']);
        yield EXT_X_VERSION_CODEC.encode(this['#EXT-X-VERSION']);
        if (this['#EXT-X-MEDIA']) {
            yield EXT_X_MEDIA_CODEC.encode(this['#EXT-X-MEDIA']);
        }
        if (this['#EXT-X-SESSION-DATA']) {
            yield EXT_X_SESSION_DATA_CODEC.encode(this['#EXT-X-SESSION-DATA']);
        }
        if (this['#EXT-X-SESSION-KEY']) {
            yield EXT_X_SESSION_KEY_CODEC.encode(this['#EXT-X-SESSION-KEY']);
        }
        if (this['#EXT-X-INDEPENDENT-SEGMENTS']) {
            yield EXT_X_INDEPENDENT_SEGMENTS_CODEC.encode(this['#EXT-X-INDEPENDENT-SEGMENTS']);
        }
        if (this['#EXT-X-START']) {
            yield EXT_X_START_CODEC.encode(this['#EXT-X-START']);
        }
        if (this['#EXT-X-DEFINE']) {
            yield EXT_X_DEFINE_CODEC.encode(this['#EXT-X-DEFINE']);
        }
        if (this['#EXT-X-CONTENT-STEERING']) {
            yield EXT_X_CONTENT_STEERING_CODEC.encode(this['#EXT-X-CONTENT-STEERING']);
        }

        for (const streamInf of this.values()) {
            yield* streamInf.toHLSLines();
        }
    }

    public toHLS(replacer?: Replacer, options?: FormatOptions): string {
        const lineEnding = options?.lineEndings ?? '\n';

        // If value replacer, apply to properties before encoding
        if (replacer && isValueReplacer(replacer)) {
            // Create a modified copy with replacer applied to values
            const modifiedOptions: Partial<MultivariantPlaylistOptions> = {};

            // Apply replacer to each playlist-level property
            for (const key of Object.keys(this) as Array<keyof MultivariantPlaylistOptions>) {
                if (key.startsWith('#')) {
                    const value = this[key];
                    const replaced = replacer(key, value);
                    if (replaced !== undefined) {
                        (modifiedOptions as any)[key] = replaced;
                    }
                }
            }

            // Reconstruct playlist with modified values
            const variantStreams = new Map<string, StreamInf>();
            for (const [uri, streamInf] of this.entries()) {
                variantStreams.set(uri, streamInf);
            }

            const tempPlaylist = new MultivariantPlaylist(
                modifiedOptions as MultivariantPlaylistOptions,
                variantStreams,
            );

            return Array.from(tempPlaylist.toHLSLines()).join(lineEnding);
        }

        // If string replacer, apply to each output line
        if (replacer && isStringReplacer(replacer)) {
            return Array.from(this.toHLSLines(), replacer).join(lineEnding);
        }

        // No replacer
        return Array.from(this.toHLSLines()).join(lineEnding);
    }

    public toJSON() {
        return {
            '#EXTM3U': this['#EXTM3U'],
            '#EXT-X-VERSION': this['#EXT-X-VERSION'],
            '#EXT-X-MEDIA': this['#EXT-X-MEDIA'],
            '#EXT-X-SESSION-DATA': this['#EXT-X-SESSION-DATA'],
            '#EXT-X-SESSION-KEY': this['#EXT-X-SESSION-KEY'],
            '#EXT-X-INDEPENDENT-SEGMENTS': this['#EXT-X-INDEPENDENT-SEGMENTS'],
            '#EXT-X-START': this['#EXT-X-START'],
            '#EXT-X-DEFINE': this['#EXT-X-DEFINE'],
            '#EXT-X-CONTENT-STEERING': this['#EXT-X-CONTENT-STEERING'],
            'STREAM-INF-VALUES': Array.from(this.values(), (streamInf) => streamInf.toJSON()),
        } as const;
    }
}
