import { Readable } from 'node:stream';
import { HlsLexicalTransformer } from '../../transformers/hls-lexical.transformer';
import { MediaPlaylistIngestTransformer } from '../../transformers/media-playlist/media-playlist.ingest.transformer';
import { MediaSegmentIngestTransformer } from '../../transformers/media-segment/media-segment.ingest.transformer';
import { NewlineTransformer } from '../../transformers/newline.transformer';
import HLSTag from '../hls-tag';
import { MEDIA_PLAYLIST_TAGS, MULTIVARIANT_PLAYLIST_TAGS } from '../hls.types';
import { EXT_X_VERSION_PARSED } from '../playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U_PARSED } from '../playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import { EXT_X_START_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import { MediaSegment } from './media-segment';
import { MediaSegmentArrayBuilder } from './media-segment-array-builder';
import { EXT_X_MEDIA_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/types';
import { EXT_X_SESSION_DATA_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/types';
import { EXT_X_SESSION_KEY_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/types';
import { VariantStream } from './variant-stream';
import { VariantStreamsArrayBuilder } from './variant-stream-array-builder';
import { MultivariantPlaylistIngestTransformer } from '../../transformers/multivariant-playlist/multivariant-playlist.ingest.transformer';
import { VariantStreamIngestTransformer } from '../../transformers/variant-stream/variant-stream.ingest.transformer';

export interface MultivariantPlaylistOptions extends Record<MULTIVARIANT_PLAYLIST_TAGS, unknown> {
    '#EXTM3U': EXTM3U_PARSED;
    '#EXT-X-VERSION': EXT_X_VERSION_PARSED;
    '#EXT-X-MEDIA': EXT_X_MEDIA_PARSED;
    'EXT-X-SESSION-DATA': EXT_X_SESSION_DATA_PARSED[];
    'EXT-X-SESSION-KEY': EXT_X_SESSION_KEY_PARSED;
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS_PARSED;
    '#EXT-X-START': EXT_X_START_PARSED;
    variantStreams: MediaSegmentArrayBuilder;
}

export class MultivariantPlaylist extends Map<string, VariantStream> {
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
     * /**
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
    public readonly '#EXT-X-SESSION-DATA': MultivariantPlaylistOptions['EXT-X-SESSION-DATA'];

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
    public readonly '#EXT-X-SESSION-KEY': MultivariantPlaylistOptions['EXT-X-SESSION-KEY'];

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
        mediaPlaylistOptions: MultivariantPlaylistOptions,
        variantStreams: Iterable<VariantStream>,
    ) {
        super(Array.from(variantStreams, (variantStream) => [variantStream.URI, variantStream]));
        Object.assign(this, mediaPlaylistOptions);
    }

    public static async from(source: Readable | Iterable<string>): Promise<MultivariantPlaylist> {
        const stream = source instanceof Readable ? source : Readable.from(source);

        const pipeline = stream
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new MultivariantPlaylistIngestTransformer())
            .pipe(new VariantStreamIngestTransformer());

        return await MultivariantPlaylist.fromTokenStream(pipeline);
    }

    static async fromTokenStream(tokenStream: Readable): Promise<MultivariantPlaylist> {
        const multivariantPlaylistOptions: Partial<MultivariantPlaylistOptions> = {};
        const variantStreamsArrayBuilder = new VariantStreamsArrayBuilder();

        let parsingStreamVariants: boolean = false;
        for await (const token of tokenStream) {
            if (parsingStreamVariants == false) {
                switch (token.type) {
                    case HLSTag('#EXTM3U'): {
                        multivariantPlaylistOptions['#EXTM3U'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-VERSION'): {
                        multivariantPlaylistOptions['#EXT-X-VERSION'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-MEDIA'): {
                        multivariantPlaylistOptions['#EXT-X-MEDIA'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-SESSION-DATA'): {
                        multivariantPlaylistOptions['#EXT-X-SESSION-DATA'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-SESSION-KEY'): {
                        multivariantPlaylistOptions['#EXT-X-SESSION-KEY'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-INDEPENDENT-SEGMENTS'): {
                        multivariantPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'] =
                            token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-START'): {
                        multivariantPlaylistOptions['#EXT-X-START'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-STREAM-INF'): {
                        parsingStreamVariants = true;
                        break;
                    }
                }
            }

            if (parsingStreamVariants) {
                switch (token.type) {
                    case HLSTag('#EXT-X-STREAM-INF'): {
                        variantStreamsArrayBuilder.addStreamInf(token.value as any);
                        break;
                    }
                    case HLSTag('URI'): {
                        variantStreamsArrayBuilder.addURI(token.value as any);
                        break;
                    }
                }
            }
        }
        return new MultivariantPlaylist(
            multivariantPlaylistOptions as MultivariantPlaylistOptions,
            variantStreamsArrayBuilder,
        );
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
            variantStreams: Array.from(this.values(), (variantStream) => variantStream.toJSON()),
        };
    }
}
