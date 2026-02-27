import * as z from 'zod';
import { createStream } from '../../helpers/create-stream';
import { parseTokenizedLine } from '../../parser/parse-tokenized-line';
import { LexicalToken } from '../../parser/parser.interfaces';
import { tokenizeLine } from '../../parser/tokenize-line';
import { playlistTagRegistry } from '../playlist-tags/playlist-tag.registry';
import { MediaSegment } from './media-segment';
import { MediaSegmentArrayBuilder } from './media-segment-array-builder';
import { Playlist } from './playlists.interfaces';

// Import schema types for MediaPlaylistOptions
import { EXTM3U_OBJECT } from '../playlist-tags/basic-tags/EXTM3U/schema';
import { EXT_X_VERSION_OBJECT } from '../playlist-tags/basic-tags/EXT-X-VERSION/schema';
import { EXT_X_TARGETDURATION_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/schema';
import { EXT_X_MEDIA_SEQUENCE_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/schema';
import { EXT_X_DISCONTINUITY_SEQUENCE_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/schemas';
import { EXT_X_ENDLIST_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-ENDLIST/schema';
import { EXT_X_PLAYLIST_TYPE_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/schema';
import { EXT_X_I_FRAMES_ONLY_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/schema';
import { EXT_X_INDEPENDENT_SEGMENTS_OBJECT } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/schema';
import { EXT_X_START_OBJECT } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/schema';
import { EXT_X_DEFINE_OBJECT } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-DEFINE/schema';
import { EXT_X_SERVER_CONTROL_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-SERVER-CONTROL/schema';
import { EXT_X_PART_INF_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-PART-INF/schema';
import { EXT_X_PRELOAD_HINT_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-PRELOAD-HINT/schema';
import { EXT_X_SKIP_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-SKIP/schema';
import { EXT_X_RENDITION_REPORT_OBJECT } from '../playlist-tags/media-playlist-tags/EXT-X-RENDITION-REPORT/schema';

// Define MediaPlaylistOptions interface using schema types
export interface MediaPlaylistOptions {
    '#EXTM3U': z.infer<typeof EXTM3U_OBJECT>;
    '#EXT-X-VERSION'?: z.infer<typeof EXT_X_VERSION_OBJECT>;
    '#EXT-X-TARGETDURATION': z.infer<typeof EXT_X_TARGETDURATION_OBJECT>;
    '#EXT-X-MEDIA-SEQUENCE'?: z.infer<typeof EXT_X_MEDIA_SEQUENCE_OBJECT>;
    '#EXT-X-DISCONTINUITY-SEQUENCE'?: z.infer<typeof EXT_X_DISCONTINUITY_SEQUENCE_OBJECT>;
    '#EXT-X-ENDLIST'?: z.infer<typeof EXT_X_ENDLIST_OBJECT>;
    '#EXT-X-PLAYLIST-TYPE'?: z.infer<typeof EXT_X_PLAYLIST_TYPE_OBJECT>;
    '#EXT-X-I-FRAMES-ONLY'?: z.infer<typeof EXT_X_I_FRAMES_ONLY_OBJECT>;
    '#EXT-X-INDEPENDENT-SEGMENTS'?: z.infer<typeof EXT_X_INDEPENDENT_SEGMENTS_OBJECT>;
    '#EXT-X-START'?: z.infer<typeof EXT_X_START_OBJECT>;
    '#EXT-X-DEFINE'?: z.infer<typeof EXT_X_DEFINE_OBJECT>;
    '#EXT-X-SERVER-CONTROL'?: z.infer<typeof EXT_X_SERVER_CONTROL_OBJECT>;
    '#EXT-X-PART-INF'?: z.infer<typeof EXT_X_PART_INF_OBJECT>;
    '#EXT-X-PRELOAD-HINT'?: z.infer<typeof EXT_X_PRELOAD_HINT_OBJECT>;
    '#EXT-X-SKIP'?: z.infer<typeof EXT_X_SKIP_OBJECT>;
    '#EXT-X-RENDITION-REPORT'?: z.infer<typeof EXT_X_RENDITION_REPORT_OBJECT>;
}
export class MediaPlaylist extends Map<string, MediaSegment> implements Playlist {
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

    @default 0
    */
    public readonly '#EXT-X-MEDIA-SEQUENCE': MediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'] = 0;

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
    @default 0
    */
    public readonly '#EXT-X-DISCONTINUITY-SEQUENCE': MediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'] = 0;

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
    public readonly '#EXT-X-DEFINE': MediaPlaylistOptions['#EXT-X-DEFINE'];

    /**
     * The EXT-X-SERVER-CONTROL tag allows the server to indicate support for
     * delivery directives for Low-Latency HLS. It specifies how a client can
     * request playlist delta updates and block for playlist updates.
     *
     * Its format is:
     *
     * #EXT-X-SERVER-CONTROL:<attribute-list>
     *
     * Attributes include CAN-SKIP-UNTIL, CAN-SKIP-DATERANGES, HOLD-BACK,
     * PART-HOLD-BACK, and CAN-BLOCK-RELOAD.
     */
    public readonly '#EXT-X-SERVER-CONTROL': MediaPlaylistOptions['#EXT-X-SERVER-CONTROL'];

    /**
     * The EXT-X-PART-INF tag indicates that the playlist contains Partial
     * Segments and provides information about them. This is required for
     * Low-Latency HLS playlists.
     *
     * Its format is:
     *
     * #EXT-X-PART-INF:PART-TARGET=<decimal-floating-point>
     *
     * The PART-TARGET attribute indicates the target duration for Partial
     * Segments in seconds.
     */
    public readonly '#EXT-X-PART-INF': MediaPlaylistOptions['#EXT-X-PART-INF'];

    /**
     * The EXT-X-PRELOAD-HINT tag allows the server to suggest resources
     * for the client to preload. This helps reduce latency in Low-Latency
     * HLS by allowing clients to request resources before they appear in
     * the playlist.
     *
     * Its format is:
     *
     * #EXT-X-PRELOAD-HINT:<attribute-list>
     *
     * Attributes include TYPE (PART or MAP), URI, BYTERANGE-START, and
     * BYTERANGE-LENGTH.
     */
    public readonly '#EXT-X-PRELOAD-HINT': MediaPlaylistOptions['#EXT-X-PRELOAD-HINT'];

    /**
     * The EXT-X-SKIP tag indicates that the server has removed one or more
     * Media Segments from the beginning of the playlist. This is used for
     * playlist delta updates in Low-Latency HLS.
     *
     * Its format is:
     *
     * #EXT-X-SKIP:<attribute-list>
     *
     * Attributes include SKIPPED-SEGMENTS and RECENTLY-REMOVED-DATERANGES.
     */
    public readonly '#EXT-X-SKIP': MediaPlaylistOptions['#EXT-X-SKIP'];

    /**
     * The EXT-X-RENDITION-REPORT tag provides information about the state
     * of other renditions in a multivariant presentation. This enables
     * faster rendition switching in Low-Latency HLS.
     *
     * Its format is:
     *
     * #EXT-X-RENDITION-REPORT:<attribute-list>
     *
     * Attributes include URI, LAST-MSN, and LAST-PART.
     */
    public readonly '#EXT-X-RENDITION-REPORT': MediaPlaylistOptions['#EXT-X-RENDITION-REPORT'];

    private constructor(
        mediaPlaylistOptions: MediaPlaylistOptions,
        mediaSegments: Map<string, MediaSegment>,
    ) {
        super(Array.from(mediaSegments.entries()));

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
        this['#EXT-X-DEFINE'] = mediaPlaylistOptions['#EXT-X-DEFINE'];
        this['#EXT-X-SERVER-CONTROL'] = mediaPlaylistOptions['#EXT-X-SERVER-CONTROL'];
        this['#EXT-X-PART-INF'] = mediaPlaylistOptions['#EXT-X-PART-INF'];
        this['#EXT-X-PRELOAD-HINT'] = mediaPlaylistOptions['#EXT-X-PRELOAD-HINT'];
        this['#EXT-X-SKIP'] = mediaPlaylistOptions['#EXT-X-SKIP'];
        this['#EXT-X-RENDITION-REPORT'] = mediaPlaylistOptions['#EXT-X-RENDITION-REPORT'];
    }

    private static isMediaSegmentTag(tag: string) {
        return (
            tag === '#EXT-X-PROGRAM-DATE-TIME' ||
            tag === 'URI' ||
            tag === '#EXTINF' ||
            tag === '#EXT-X-BYTERANGE' ||
            tag === '#EXT-X-DISCONTINUITY' ||
            tag === '#EXT-X-KEY' ||
            tag === '#EXT-X-MAP' ||
            tag === '#EXT-X-DATERANGE' ||
            tag === '#EXT-X-GAP' ||
            tag === '#EXT-X-BITRATE' ||
            tag === '#EXT-X-PART' ||
            tag === '#EXT-X-CUE-OUT' ||
            tag === '#EXT-X-CUE-IN' ||
            tag === '#EXT-X-CUE-OUT-CONT' ||
            tag === '#EXT-X-ASSET' ||
            tag === '#EXT-X-SPLICEPOINT-SCTE35'
        );
    }

    private static buildPlaylistOptions(
        token: LexicalToken,
        mediaPlaylistOptions: Partial<MediaPlaylistOptions>,
    ): Partial<MediaPlaylistOptions> {
        // token.value has already been decoded by parseTokenizedLine, so use it directly
        mediaPlaylistOptions[token.type as keyof MediaPlaylistOptions] = token.value as any;
        return mediaPlaylistOptions;
    }

    private static buildSegments(
        token: LexicalToken,
        mediaSegmentsArrayBuilder: MediaSegmentArrayBuilder,
    ): MediaSegmentArrayBuilder {
        switch (token.type as string) {
            case '#EXTINF': {
                mediaSegmentsArrayBuilder.addStreamInf(token.value as any);
                break;
            }
            case 'URI': {
                mediaSegmentsArrayBuilder.addURI(token.value as any);
                break;
            }
            case '#EXT-X-BYTERANGE': {
                mediaSegmentsArrayBuilder.addByteRange(token.value as any);
                break;
            }
            case '#EXT-X-DISCONTINUITY': {
                mediaSegmentsArrayBuilder.addDiscontinuity(token.value as any);
                break;
            }
            case '#EXT-X-KEY': {
                mediaSegmentsArrayBuilder.addKey(token.value as any);
                break;
            }
            case '#EXT-X-MAP': {
                mediaSegmentsArrayBuilder.addMap(token.value as any);
                break;
            }
            case '#EXT-X-PROGRAM-DATE-TIME': {
                mediaSegmentsArrayBuilder.addProgramDateTime(token.value as any);
                break;
            }
            case '#EXT-X-DATERANGE': {
                mediaSegmentsArrayBuilder.addDateRange(token.value as any);
                break;
            }
            case '#EXT-X-GAP': {
                mediaSegmentsArrayBuilder.addGap(token.value as any);
                break;
            }
            case '#EXT-X-BITRATE': {
                mediaSegmentsArrayBuilder.addBitrate(token.value as any);
                break;
            }
            case '#EXT-X-PART': {
                mediaSegmentsArrayBuilder.addPart(token.value as any);
                break;
            }
            case '#EXT-X-CUE-OUT': {
                mediaSegmentsArrayBuilder.addCueOut(token.value as any);
                break;
            }
            case '#EXT-X-CUE-IN': {
                mediaSegmentsArrayBuilder.addCueIn(token.value as any);
                break;
            }
            case '#EXT-X-CUE-OUT-CONT': {
                mediaSegmentsArrayBuilder.addCueOutCont(token.value as any);
                break;
            }
            case '#EXT-X-ASSET': {
                mediaSegmentsArrayBuilder.addAsset(token.value as any);
                break;
            }
            case '#EXT-X-SPLICEPOINT-SCTE35': {
                mediaSegmentsArrayBuilder.addSplicepointScte35(token.value as any);
                break;
            }
        }
        return mediaSegmentsArrayBuilder;
    }

    public static fromString(input: string): MediaPlaylist {
        const mediaPlaylistOptions: Partial<MediaPlaylistOptions> = {};
        const mediaSegmentsArrayBuilder = new MediaSegmentArrayBuilder();

        let parsingSegments: boolean = false;

        for (const line of input.split('\n')) {
            const token = parseTokenizedLine(tokenizeLine(line));
            if (token.type === '#EXT-X-ENDLIST') {
                mediaPlaylistOptions['#EXT-X-ENDLIST'] = token.value as any;
                continue;
            }

            if (parsingSegments === false) {
                MediaPlaylist.buildPlaylistOptions(token, mediaPlaylistOptions);
                parsingSegments = MediaPlaylist.isMediaSegmentTag(token.type);
            }
            if (parsingSegments) {
                MediaPlaylist.buildSegments(token, mediaSegmentsArrayBuilder);
            }
        }

        return new MediaPlaylist(
            mediaPlaylistOptions as MediaPlaylistOptions,
            mediaSegmentsArrayBuilder,
        );
    }

    public static async fromStream<
        Input extends Iterable<string> | AsyncIterable<string | Uint8Array>,
    >(source: Input): Promise<MediaPlaylist> {
        const tokenizedStream: AsyncIterable<LexicalToken> = createStream(source);

        const mediaPlaylistOptions: Partial<MediaPlaylistOptions> = {};
        const mediaSegmentsArrayBuilder = new MediaSegmentArrayBuilder();

        let parsingSegments: boolean = false;
        for await (const token of tokenizedStream) {
            if (token.type === '#EXT-X-ENDLIST') {
                mediaPlaylistOptions['#EXT-X-ENDLIST'] = token.value as any;
                continue;
            }

            if (parsingSegments === false) {
                MediaPlaylist.buildPlaylistOptions(token, mediaPlaylistOptions);
                parsingSegments = MediaPlaylist.isMediaSegmentTag(token.type);
            }
            if (parsingSegments) {
                MediaPlaylist.buildSegments(token, mediaSegmentsArrayBuilder);
            }
        }
        return new MediaPlaylist(
            mediaPlaylistOptions as MediaPlaylistOptions,
            mediaSegmentsArrayBuilder,
        );
    }

    public static isMediaPlaylist(input: string): boolean {
        return input.includes('#EXT-X-TARGETDURATION');
    }

    public *toHLSLines() {
        // Use schema encoders for stringifying
        if (this['#EXTM3U']) {
            yield playlistTagRegistry['#EXTM3U'].encode(this['#EXTM3U']);
        }
        if (this['#EXT-X-VERSION']) {
            yield playlistTagRegistry['#EXT-X-VERSION'].encode(this['#EXT-X-VERSION']);
        }
        if (this['#EXT-X-TARGETDURATION']) {
            yield playlistTagRegistry['#EXT-X-TARGETDURATION'].encode(
                this['#EXT-X-TARGETDURATION'],
            );
        }
        if (this['#EXT-X-MEDIA-SEQUENCE'] && this['#EXT-X-MEDIA-SEQUENCE'] > 0) {
            yield playlistTagRegistry['#EXT-X-MEDIA-SEQUENCE'].encode(
                this['#EXT-X-MEDIA-SEQUENCE'],
            );
        }
        if (this['#EXT-X-DISCONTINUITY-SEQUENCE'] && this['#EXT-X-DISCONTINUITY-SEQUENCE'] > 0) {
            yield playlistTagRegistry['#EXT-X-DISCONTINUITY-SEQUENCE'].encode(
                this['#EXT-X-DISCONTINUITY-SEQUENCE'],
            );
        }
        if (this['#EXT-X-PLAYLIST-TYPE']) {
            yield playlistTagRegistry['#EXT-X-PLAYLIST-TYPE'].encode(this['#EXT-X-PLAYLIST-TYPE']);
        }
        if (this['#EXT-X-I-FRAMES-ONLY']) {
            yield playlistTagRegistry['#EXT-X-I-FRAMES-ONLY'].encode(this['#EXT-X-I-FRAMES-ONLY']);
        }
        if (this['#EXT-X-INDEPENDENT-SEGMENTS']) {
            yield playlistTagRegistry['#EXT-X-INDEPENDENT-SEGMENTS'].encode(
                this['#EXT-X-INDEPENDENT-SEGMENTS'],
            );
        }
        if (this['#EXT-X-START']) {
            yield playlistTagRegistry['#EXT-X-START'].encode(this['#EXT-X-START']);
        }
        if (this['#EXT-X-DEFINE']) {
            yield playlistTagRegistry['#EXT-X-DEFINE'].encode(this['#EXT-X-DEFINE']);
        }
        if (this['#EXT-X-SERVER-CONTROL']) {
            yield playlistTagRegistry['#EXT-X-SERVER-CONTROL'].encode(this['#EXT-X-SERVER-CONTROL']);
        }
        if (this['#EXT-X-PART-INF']) {
            yield playlistTagRegistry['#EXT-X-PART-INF'].encode(this['#EXT-X-PART-INF']);
        }
        if (this['#EXT-X-PRELOAD-HINT']) {
            yield playlistTagRegistry['#EXT-X-PRELOAD-HINT'].encode(this['#EXT-X-PRELOAD-HINT']);
        }
        if (this['#EXT-X-SKIP']) {
            yield playlistTagRegistry['#EXT-X-SKIP'].encode(this['#EXT-X-SKIP']);
        }
        if (this['#EXT-X-RENDITION-REPORT']) {
            yield playlistTagRegistry['#EXT-X-RENDITION-REPORT'].encode(this['#EXT-X-RENDITION-REPORT']);
        }

        for (const segment of this.values()) {
            yield* segment.toHLSLines();
        }

        if (this['#EXT-X-ENDLIST']) {
            yield playlistTagRegistry['#EXT-X-ENDLIST'].encode(this['#EXT-X-ENDLIST']);
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
            '#EXT-X-DEFINE': this['#EXT-X-DEFINE'],
            '#EXT-X-SERVER-CONTROL': this['#EXT-X-SERVER-CONTROL'],
            '#EXT-X-PART-INF': this['#EXT-X-PART-INF'],
            '#EXT-X-PRELOAD-HINT': this['#EXT-X-PRELOAD-HINT'],
            '#EXT-X-SKIP': this['#EXT-X-SKIP'],
            '#EXT-X-RENDITION-REPORT': this['#EXT-X-RENDITION-REPORT'],
            mediaSegments: Array.from(this.values(), (segment) => segment.toJSON()),
            '#EXT-X-ENDLIST': this['#EXT-X-ENDLIST'],
        };
    }
}
