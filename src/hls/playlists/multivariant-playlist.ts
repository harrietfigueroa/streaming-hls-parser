import { Readable } from 'node:stream';
import { MULTIVARIANT_PLAYLIST_TAGS } from '../hls.types';
import { EXT_X_VERSION_PARSED } from '../playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U_PARSED } from '../playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import { EXT_X_START_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import { EXT_X_MEDIA_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/types';
import { EXT_X_SESSION_DATA_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/types';
import { EXT_X_SESSION_KEY_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/types';
import { MediaSegmentArrayBuilder } from './media-segment-array-builder';
import { StreamInf, VariantStreamOptions } from './stream-inf';
import { StreamInfArrayBuilder } from './stream-inf-array-builder';
import validateEXTXMedia from '../playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/validator';
import validateEXTXSessionKey from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/validator';
import { HLSPlaylist } from './hls-playlist';

import stringifyEXTM3U from '../playlist-tags/basic-tags/EXTM3U/stringifier';
import stringifyEXTXVersion from '../playlist-tags/basic-tags/EXT-X-VERSION/stringifier';
import stringifyEXTXMedia from '../playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/stringifier';
import stringifyEXTXIndependentSegments from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/stringifier';
import stringifyEXTXStart from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/stringifier';
import stringifyEXTXSessionData from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/stringifier';
import stringifyEXTXSessionKey from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/stringifier';
import { HlsParseTransformer } from '../../stream-transformers/hls-parse.transformer';
import { tokenizeLine } from '../../parser/tokenize-line';
import { parseTokenizedLine } from '../../parser/parse-tokenized-line';
import { LexicalToken } from '../../parser/parser.interfaces';

export interface MultivariantPlaylistOptions {
    '#EXTM3U': EXTM3U_PARSED;
    '#EXT-X-VERSION': EXT_X_VERSION_PARSED;
    '#EXT-X-MEDIA': EXT_X_MEDIA_PARSED;
    '#EXT-X-SESSION-DATA': EXT_X_SESSION_DATA_PARSED;
    '#EXT-X-SESSION-KEY': EXT_X_SESSION_KEY_PARSED;
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS_PARSED;
    '#EXT-X-START': EXT_X_START_PARSED;
}

export class MultivariantPlaylist
    extends HLSPlaylist<VariantStreamOptions>
    implements MultivariantPlaylistOptions
{
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

    private constructor(
        multivariantPlaylistOptions: MultivariantPlaylistOptions,
        variantStreams: Map<string, StreamInf>,
    ) {
        super(variantStreams);

        const errors: Error[] = [];

        // Validate each property and collect errors
        const mediaErrors = validateEXTXMedia(multivariantPlaylistOptions['#EXT-X-MEDIA']);
        if (mediaErrors.length > 0) {
            errors.push(new Error('#EXT-X-MEDIA validation failed', { cause: mediaErrors }));
        }

        const sessionKeyErrors = validateEXTXSessionKey(
            multivariantPlaylistOptions['#EXT-X-SESSION-KEY'],
        );
        if (sessionKeyErrors.length > 0) {
            errors.push(
                new Error('#EXT-X-SESSION-KEY validation failed', { cause: sessionKeyErrors }),
            );
        }

        // If there are any errors, throw a single aggregated error
        if (errors.length > 0) {
            this.error = new Error('MultivariantPlaylist validation failed', { cause: errors });
        }

        this['#EXTM3U'] = multivariantPlaylistOptions['#EXTM3U'];
        this['#EXT-X-VERSION'] = multivariantPlaylistOptions['#EXT-X-VERSION'];
        this['#EXT-X-MEDIA'] = multivariantPlaylistOptions['#EXT-X-MEDIA'];
        this['#EXT-X-SESSION-DATA'] = multivariantPlaylistOptions['#EXT-X-SESSION-DATA'];
        this['#EXT-X-SESSION-KEY'] = multivariantPlaylistOptions['#EXT-X-SESSION-KEY'];
        this['#EXT-X-INDEPENDENT-SEGMENTS'] =
            multivariantPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];
        this['#EXT-X-START'] = multivariantPlaylistOptions['#EXT-X-START'];
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

    public static fromString(input: string): MultivariantPlaylist {
        const multivariantPlaylistOptions: Partial<MultivariantPlaylistOptions> = {};
        const variantStreamsArrayBuilder = new StreamInfArrayBuilder();

        let parsingStreamVariants: boolean = false;

        input.split('\n').map((line) => {
            const token = parseTokenizedLine(tokenizeLine(line));
            if (parsingStreamVariants === false) {
                MultivariantPlaylist.buildPlaylistOptions(token, multivariantPlaylistOptions);
                if (token.type === '#EXT-X-STREAM-INF') {
                    parsingStreamVariants = true;
                }
            }

            if (parsingStreamVariants) {
                MultivariantPlaylist.buildVariantStreams(token, variantStreamsArrayBuilder);
            }
        });

        return new MultivariantPlaylist(
            multivariantPlaylistOptions as MultivariantPlaylistOptions,
            variantStreamsArrayBuilder,
        );
    }

    public static async fromStream<Input extends Iterable<string> | AsyncIterable<string>>(
        source: Input,
    ): Promise<MultivariantPlaylist> {
        const tokenizedStream = super.createStream(source);

        const multivariantPlaylistOptions: Partial<MultivariantPlaylistOptions> = {};
        const variantStreamsArrayBuilder = new StreamInfArrayBuilder();

        let parsingStreamVariants: boolean = false;
        for await (const token of tokenizedStream) {
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

    public *toHLSLines(): Iterable<string> {
        yield stringifyEXTM3U();
        yield stringifyEXTXVersion(this['#EXT-X-VERSION']);
        if (this['#EXT-X-MEDIA']) {
            yield stringifyEXTXMedia(this['#EXT-X-MEDIA']);
        }
        if (this['#EXT-X-SESSION-DATA']) {
            yield stringifyEXTXSessionData(this['#EXT-X-SESSION-DATA']);
        }
        if (this['#EXT-X-SESSION-KEY']) {
            yield stringifyEXTXSessionKey(this['#EXT-X-SESSION-KEY']);
        }
        if (this['#EXT-X-INDEPENDENT-SEGMENTS']) {
            yield stringifyEXTXIndependentSegments();
        }
        if (this['#EXT-X-START']) {
            yield stringifyEXTXStart(this['#EXT-X-START']);
        }

        yield* this.childHLSValues();
    }

    public toJSON(): any {
        return {
            '#EXTM3U': this['#EXTM3U'],
            '#EXT-X-VERSION': this['#EXT-X-VERSION'],
            '#EXT-X-MEDIA': this['#EXT-X-MEDIA'],
            '#EXT-X-SESSION-DATA': this['#EXT-X-SESSION-DATA'],
            '#EXT-X-SESSION-KEY': this['#EXT-X-SESSION-KEY'],
            '#EXT-X-INDEPENDENT-SEGMENTS': this['#EXT-X-INDEPENDENT-SEGMENTS'],
            '#EXT-X-START': this['#EXT-X-START'],
            'STREAM-INF-VALUES': Array.from(this.values(), (streamInf) => streamInf.toJSON()),
        };
    }
}
