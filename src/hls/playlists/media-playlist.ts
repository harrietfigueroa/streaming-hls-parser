import HLSTag from '../../hls/hls-tag';
import { MediaPlaylistIngestTransformer } from '../../transformers/media-playlist/media-playlist.ingest.transformer';
import { MediaSegmentIngestTransformer } from '../../transformers/media-segment/media-segment.ingest.transformer';
import { MEDIA_PLAYLIST_TAGS } from '../hls.types';
import stringifyVersion from '../playlist-tags/basic-tags/EXT-X-VERSION/stringifier';
import { EXT_X_VERSION_PARSED } from '../playlist-tags/basic-tags/EXT-X-VERSION/types';
import stringifyEXTM3U from '../playlist-tags/basic-tags/EXTM3U/stringifier';
import { EXTM3U_PARSED } from '../playlist-tags/basic-tags/EXTM3U/types';
import stringifyIndependentSegments from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/stringifier';
import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import stringifyStart from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/stringifier';
import { EXT_X_START_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import stringifyDiscontinuitySequence from '../playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/stringifier';
import { EXT_X_DISCONTINUITY_SEQUENCE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/types';
import stringifyEndlist from '../playlist-tags/media-playlist-tags/EXT-X-ENDLIST/stringifier';
import { EXT_X_ENDLIST_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-ENDLIST/types';
import stringifyIFramesOnly from '../playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/stringifier';
import { EXT_X_I_FRAMES_ONLY_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/types';
import stringifyMediaSequence from '../playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/stringifier';
import { EXT_X_MEDIA_SEQUENCE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/types';
import stringifyPlaylistType from '../playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/stringifier';
import { EXT_X_PLAYLIST_TYPE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/types';
import stringifyTargetDuration from '../playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/stringifier';
import { EXT_X_TARGETDURATION_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/types';
import { HLSObject } from './hls-object';
import { MediaSegment, MediaSegmentOptions } from './media-segment';
import { MediaSegmentArrayBuilder } from './media-segment-array-builder';
import validateEXTXMedia from '../playlist-tags/multivariant-playlist-tags/EXT-X-MEDIA/validator';
import validateEXTXSessionData from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-DATA/validator';
import validateEXTXSessionKey from '../playlist-tags/multivariant-playlist-tags/EXT-X-SESSION-KEY/validator';
import { HLSPlaylist } from './hls-playlist';

export interface MediaPlaylistOptions {
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
}

export class MediaPlaylist extends HLSPlaylist<MediaSegmentOptions> {
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

        // Validate each property and collect errors

        this['#EXTM3U'] = mediaPlaylistOptions['#EXTM3U'];
        this['#EXT-X-VERSION'] = mediaPlaylistOptions['#EXT-X-VERSION'];
        this['#EXT-X-TARGETDURATION'] = mediaPlaylistOptions['#EXT-X-TARGETDURATION'];
        this['#EXT-X-MEDIA-SEQUENCE'] = mediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'];
        this['#EXT-X-DISCONTINUITY-SEQUENCE'] =
            mediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'];
        this['#EXT-X-ENDLIST'] = mediaPlaylistOptions['#EXT-X-ENDLIST'];
        this['#EXT-X-PLAYLIST-TYPE'] = mediaPlaylistOptions['#EXT-X-PLAYLIST-TYPE'];
        this['#EXT-X-I-FRAMES-ONLY'] = mediaPlaylistOptions['#EXT-X-I-FRAMES-ONLY'];
        this['#EXT-X-INDEPENDENT-SEGMENTS'] = mediaPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];
        this['#EXT-X-START'] = mediaPlaylistOptions['#EXT-X-START'];
    }

    public static async from<Input extends Iterable<string> | AsyncIterable<string | Uint8Array>>(
        source: Input,
    ): Promise<MediaPlaylist> {
        const tokenizedStream = super
            .createTokenizedStream(source)
            .pipe(new MediaPlaylistIngestTransformer())
            .pipe(new MediaSegmentIngestTransformer());

        const mediaPlaylistOptions: Partial<MediaPlaylistOptions> = {};
        const mediaSegmentsArrayBuilder = new MediaSegmentArrayBuilder();

        let parsingSegments: boolean = false;
        for await (const token of tokenizedStream) {
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
                    default: {
                        parsingSegments = MediaPlaylist.isMediaSegmentTag(token.type);
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

    static isMediaSegmentTag(tag: Symbol) {
        return (
            tag === HLSTag('#EXTINF') ||
            tag === HLSTag('#EXT-X-BYTERANGE') ||
            tag === HLSTag('#EXT-X-DISCONTINUITY') ||
            tag === HLSTag('#EXT-X-KEY') ||
            tag === HLSTag('#EXT-X-MAP') ||
            tag === HLSTag('#EXT-X-PROGRAM-DATE-TIME') ||
            tag === HLSTag('#EXT-X-DATERANGE')
        );
    }

    public *toHLSLines() {
        yield* [
            stringifyEXTM3U(),
            stringifyTargetDuration(this['#EXT-X-TARGETDURATION']),
            stringifyVersion(this['#EXT-X-VERSION']),
        ];
        if (this['#EXT-X-MEDIA-SEQUENCE']) {
            yield stringifyMediaSequence(this['#EXT-X-MEDIA-SEQUENCE']);
        }
        if (this['#EXT-X-DISCONTINUITY-SEQUENCE']) {
            yield stringifyDiscontinuitySequence(this['#EXT-X-DISCONTINUITY-SEQUENCE']);
        }
        if (this['#EXT-X-PLAYLIST-TYPE']) {
            yield stringifyPlaylistType(this['#EXT-X-PLAYLIST-TYPE']);
        }
        if (this['#EXT-X-I-FRAMES-ONLY']) {
            yield stringifyIFramesOnly();
        }
        if (this['#EXT-X-INDEPENDENT-SEGMENTS']) {
            yield stringifyIndependentSegments();
        }
        if (this['#EXT-X-START']) {
            yield stringifyStart(this['#EXT-X-START']);
        }

        yield* this.childHLSValues();

        if (this['#EXT-X-ENDLIST']) {
            yield stringifyEndlist();
        }
    }

    public toHLS() {
        return Array.from(this.toHLSLines()).join('\n');
    }

    public toJSON() {
        return {
            '#EXTM3U': this['#EXTM3U'],
            '#EXT-X-VERSION': this['#EXT-X-VERSION'],
            '#EXT-X-TARGETDURATION': this['#EXT-X-TARGETDURATION'],
            '#EXT-X-MEDIA-SEQUENCE': this['#EXT-X-MEDIA-SEQUENCE'],
            '#EXT-X-DISCONTINUITY-SEQUENCE': this['#EXT-X-DISCONTINUITY-SEQUENCE'],
            '#EXT-X-PLAYLIST-TYPE': this['#EXT-X-PLAYLIST-TYPE'],
            '#EXT-X-I-FRAMES-ONLY': this['#EXT-X-I-FRAMES-ONLY'],
            '#EXT-X-INDEPENDENT-SEGMENTS': this['#EXT-X-INDEPENDENT-SEGMENTS'],
            '#EXT-X-START': this['#EXT-X-START'],
            mediaSegments: Array.from(this.childJSONValues()),
            '#EXT-X-ENDLIST': this['#EXT-X-ENDLIST'],
        };
    }
}
