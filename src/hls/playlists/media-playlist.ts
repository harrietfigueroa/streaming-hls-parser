import { pipeline, Readable } from 'node:stream';
import HLSTag from '../../hls/hls-tag';
import { HlsLexicalTransformer } from '../../transformers/hls-lexical.transformer';
import { MediaPlaylistIngestTransformer } from '../../transformers/media-playlist/media-playlist.ingest.transformer';
import { NewlineTransformer } from '../../transformers/newline.transformer';
import { MEDIA_PLAYLIST_TAGS } from '../hls.types';
import { EXT_X_VERSION_PARSED } from '../playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U_PARSED } from '../playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import { EXT_X_START_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import { EXT_X_ENDLIST_PARSED } from '../playlist-tags/media-playlist-tags/EXT-ENDLIST/types';
import { EXT_X_DISCONTINUITY_SEQUENCE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/types';
import { EXT_X_I_FRAMES_ONLY_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/types';
import { EXT_X_MEDIA_SEQUENCE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/types';
import { EXT_X_PLAYLIST_TYPE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/types';
import { EXT_X_TARGETDURATION_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/types';
import { MediaSegment } from './media-segment';
import { MediaSegmentArrayBuilder } from './media-segment-array-builder';
import { MediaSegmentIngestTransformer } from '../../transformers/media-segment/media-segment.ingest.transformer';

export interface MediaPlaylistOptions extends Record<MEDIA_PLAYLIST_TAGS, unknown> {
    '#EXTM3U': EXTM3U_PARSED;
    '#EXT-X-VERSION': EXT_X_VERSION_PARSED;
    '#EXT-X-TARGETDURATION': EXT_X_TARGETDURATION_PARSED;
    '#EXT-X-MEDIA-SEQUENCE': EXT_X_MEDIA_SEQUENCE_PARSED;
    '#EXT-X-DISCONTINUITY-SEQUENCE': EXT_X_DISCONTINUITY_SEQUENCE_PARSED;
    '#EXT-X-ENDLIST': EXT_X_ENDLIST_PARSED;
    '#EXT-X-PLAYLIST-TYPE': EXT_X_PLAYLIST_TYPE_PARSED;
    '#EXT-X-I-FRAMES-ONLY': EXT_X_I_FRAMES_ONLY_PARSED;
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS_PARSED;
    '#EXT-X-START': EXT_X_START_PARSED;
    mediaSegments: MediaSegmentArrayBuilder;
}

export class MediaPlaylist extends Map<string, MediaSegment> {
    /**
     * The EXTM3U tag indicates that the file is an Extended M3U [M3U]
     Playlist file.  It MUST be the first line of every Media Playlist and
    every Master Playlist.  Its format is:

    #EXTM3U
    */
    public readonly '#EXTM3U': MediaPlaylistOptions['#EXTM3U'];

    /**
     * The EXT-X-VERSION tag indicates the compatibility version of the
     Playlist file, its associated media, and its server.

    The EXT-X-VERSION tag applies to the entire Playlist file.  Its
    format is:

    #EXT-X-VERSION:<n>

    where n is an integer indicating the protocol compatibility version
    number.
    */
    public readonly '#EXT-X-VERSION': MediaPlaylistOptions['#EXT-X-VERSION'];

    /**
     * The EXT-X-TARGETDURATION tag specifies the maximum Media Segment
     duration.  The EXTINF duration of each Media Segment in the Playlist
    file, when rounded to the nearest integer, MUST be less than or equal
    to the target duration; longer segments can trigger playback stalls
    or other errors.  It applies to the entire Playlist file.  Its format
    is:

    #EXT-X-TARGETDURATION:<s>

    where s is a decimal-integer indicating the target duration in
    seconds.  The EXT-X-TARGETDURATION tag is REQUIRED.
    */
    public readonly '#EXT-X-TARGETDURATION': MediaPlaylistOptions['#EXT-X-TARGETDURATION'];

    /**
     * The EXT-X-MEDIA-SEQUENCE tag indicates the Media Sequence Number of
     the first Media Segment that appears in a Playlist file.  Its format
    is:

    #EXT-X-MEDIA-SEQUENCE:<number>

    where number is a decimal-integer.

    If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE
    tag, then the Media Sequence Number of the first Media Segment in the
    Media Playlist SHALL be considered to be 0.  A client MUST NOT assume
    that segments with the same Media Sequence Number in different Media
    Playlists contain matching content (see Section 6.3.2).
    */
    public readonly '#EXT-X-MEDIA-SEQUENCE': MediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'];

    /**
     * The EXT-X-DISCONTINUITY tag indicates a discontinuity between the
     Media Segment that follows it and the one that preceded it.

    Its format is:

    #EXT-X-DISCONTINUITY

    The EXT-X-DISCONTINUITY tag MUST be present if there is a change in
    any of the following characteristics:

    o  file format

    o  number, type, and identifiers of tracks

    o  timestamp sequence

    The EXT-X-DISCONTINUITY tag SHOULD be present if there is a change in
    any of the following characteristics:

    o  encoding parameters

    o  encoding sequence

    See Sections 3, 6.2.1, and 6.3.3 for more information about the EXT-
    X-DISCONTINUITY tag.
    */
    public readonly '#EXT-X-DISCONTINUITY-SEQUENCE': MediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'];

    /**
     * The EXT-X-ENDLIST tag indicates that no more Media Segments will be
     added to the Media Playlist file.  It MAY occur anywhere in the Media
    Playlist file.  Its format is:

    #EXT-X-ENDLIST
    */
    public readonly '#EXT-X-ENDLIST': MediaPlaylistOptions['#EXT-X-ENDLIST'];
    /**
     * The EXT-X-PLAYLIST-TYPE tag provides mutability information about the
     Media Playlist file.  It applies to the entire Media Playlist file.
    It is OPTIONAL.  Its format is:

    #EXT-X-PLAYLIST-TYPE:<type-enum>

    where type-enum is either EVENT or VOD.

    Section 6.2.1 defines the implications of the EXT-X-PLAYLIST-TYPE
    tag.

    If the EXT-X-PLAYLIST-TYPE value is EVENT, Media Segments can only be
    added to the end of the Media Playlist.  If the EXT-X-PLAYLIST-TYPE
    value is Video On Demand (VOD), the Media Playlist cannot change.

    If the EXT-X-PLAYLIST-TYPE tag is omitted from a Media Playlist, the
    Playlist can be updated according to the rules in Section 6.2.1 with
    no additional restrictions.  For example, a live Playlist
    (Section 6.2.2) MAY be updated to remove Media Segments in the order
    that they appeared.
    */
    public readonly '#EXT-X-PLAYLIST-TYPE': MediaPlaylistOptions['#EXT-X-PLAYLIST-TYPE'];

    /**
     * The EXT-X-PLAYLIST-TYPE tag provides mutability information about the
     Media Playlist file.  It applies to the entire Media Playlist file.
    It is OPTIONAL.  Its format is:

    #EXT-X-PLAYLIST-TYPE:<type-enum>

    where type-enum is either EVENT or VOD.

    Section 6.2.1 defines the implications of the EXT-X-PLAYLIST-TYPE
    tag.

    If the EXT-X-PLAYLIST-TYPE value is EVENT, Media Segments can only be
    added to the end of the Media Playlist.  If the EXT-X-PLAYLIST-TYPE
    value is Video On Demand (VOD), the Media Playlist cannot change.

    If the EXT-X-PLAYLIST-TYPE tag is omitted from a Media Playlist, the
    Playlist can be updated according to the rules in Section 6.2.1 with
    no additional restrictions.  For example, a live Playlist
    (Section 6.2.2) MAY be updated to remove Media Segments in the order
    that they appeared.
    */
    public readonly '#EXT-X-I-FRAMES-ONLY': MediaPlaylistOptions['#EXT-X-I-FRAMES-ONLY'];

    /**
     * The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples
     in a Media Segment can be decoded without information from other
    segments.  It applies to every Media Segment in the Playlist.

    Its format is:

    #EXT-X-INDEPENDENT-SEGMENTS
    */
    public readonly '#EXT-X-INDEPENDENT-SEGMENTS': MediaPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];

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
    public readonly '#EXT-X-START': MediaPlaylistOptions['#EXT-X-START'];

    private constructor(
        mediaPlaylistOptions: MediaPlaylistOptions,
        mediaSegments: Iterable<MediaSegment>,
    ) {
        super(Array.from(mediaSegments, (mediaSegment) => [mediaSegment.URI, mediaSegment]));
        Object.assign(this, mediaPlaylistOptions);
    }

    public static async from(source: Readable | Iterable<string>): Promise<MediaPlaylist> {
        const stream = source instanceof Readable ? source : Readable.from(source);

        const pipeline = stream
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new MediaPlaylistIngestTransformer())
            .pipe(new MediaSegmentIngestTransformer());

        return await MediaPlaylist.fromTokenStream(pipeline);
    }

    static async fromTokenStream(tokenStream: Readable): Promise<MediaPlaylist> {
        const mediaPlaylistOptions: Partial<MediaPlaylistOptions> = {};
        const mediaSegmentsArrayBuilder = new MediaSegmentArrayBuilder();

        let parsingSegments: boolean = false;
        for await (const token of tokenStream) {
            if (token.type === HLSTag('#EXT-X-ENDLIST')) {
                mediaPlaylistOptions['#EXT-X-ENDLIST'] = token.value as any;
            }

            if (parsingSegments == false) {
                switch (token.type) {
                    case HLSTag('#EXTM3U'): {
                        mediaPlaylistOptions['#EXTM3U'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-VERSION'): {
                        mediaPlaylistOptions['#EXT-X-VERSION'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-TARGETDURATION'): {
                        mediaPlaylistOptions['#EXT-X-TARGETDURATION'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-MEDIA-SEQUENCE'): {
                        mediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-DISCONTINUITY-SEQUENCE'): {
                        mediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-ENDLIST'): {
                        mediaPlaylistOptions['#EXT-X-ENDLIST'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-PLAYLIST-TYPE'): {
                        mediaPlaylistOptions['#EXT-X-PLAYLIST-TYPE'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-I-FRAMES-ONLY'): {
                        mediaPlaylistOptions['#EXT-X-I-FRAMES-ONLY'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-INDEPENDENT-SEGMENTS'): {
                        mediaPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-START'): {
                        mediaPlaylistOptions['#EXT-X-START'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXTINF'): {
                        parsingSegments = true;
                        break;
                    }
                }
            }

            if (parsingSegments) {
                switch (token.type) {
                    case HLSTag('#EXTINF'): {
                        mediaSegmentsArrayBuilder.addStreamInf(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-BYTERANGE'): {
                        mediaSegmentsArrayBuilder.addByteRange(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-DISCONTINUITY'): {
                        mediaSegmentsArrayBuilder.addDiscontinuity(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-KEY'): {
                        mediaSegmentsArrayBuilder.addKey(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-MAP'): {
                        mediaSegmentsArrayBuilder.addMap(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-PROGRAM-DATE-TIME'): {
                        mediaSegmentsArrayBuilder.addProgramDateTime(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-DATERANGE'): {
                        mediaSegmentsArrayBuilder.addDateRange(token.value as any);
                        break;
                    }
                    case HLSTag('URI'): {
                        mediaSegmentsArrayBuilder.addURI(token.value as any);
                        break;
                    }
                }
            }
        }
        return new MediaPlaylist(
            mediaPlaylistOptions as MediaPlaylistOptions,
            mediaSegmentsArrayBuilder,
        );
    }
}
