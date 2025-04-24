import stringifyEXTXByterange from '../playlist-tags/media-segment-tags/EXT-X-BYTERANGE/stringifier';
import { EXT_X_BYTERANGE_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-BYTERANGE/types';
import stringifyEXTXDaterange from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/stringifier';
import { EXT_X_DATERANGE_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/type';
import validateEXTXDaterange from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/validator';
import stringifyEXTXDiscontinuity from '../playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/stringifier';
import { EXT_X_DISCONTINUITY_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/types';
import stringifyEXTXKey from '../playlist-tags/media-segment-tags/EXT-X-KEY/stringifier';
import { EXT_X_KEY_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-KEY/types';
import validateEXTXKey from '../playlist-tags/media-segment-tags/EXT-X-KEY/validator';
import stringifyEXTXMap from '../playlist-tags/media-segment-tags/EXT-X-MAP/stringifier';
import { EXT_X_MAP_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-MAP/types';
import validateEXTXMap from '../playlist-tags/media-segment-tags/EXT-X-MAP/validator';
import stringifyEXTXProgramDateTime from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/stringifier';
import { EXT_X_PROGRAM_DATE_TIME_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/types';
import validateEXTXProgramDateTime from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/validator';
import stringifyEXTINF from '../playlist-tags/media-segment-tags/EXTINF/stringifier';
import { EXTINF_PARSED } from '../playlist-tags/media-segment-tags/EXTINF/types';
import { HLSObject } from './hls-object';

export interface MediaSegmentOptions {
    '#EXTINF': EXTINF_PARSED;
    '#EXT-X-BYTERANGE': EXT_X_BYTERANGE_PARSED;
    '#EXT-X-DISCONTINUITY': EXT_X_DISCONTINUITY_PARSED;
    '#EXT-X-KEY': EXT_X_KEY_PARSED;
    '#EXT-X-MAP': EXT_X_MAP_PARSED;
    '#EXT-X-PROGRAM-DATE-TIME': EXT_X_PROGRAM_DATE_TIME_PARSED;
    '#EXT-X-DATERANGE': EXT_X_DATERANGE_PARSED;
    URI: string;
}
export class MediaSegment extends HLSObject<MediaSegmentOptions> implements MediaSegmentOptions {
    /**
   * The EXTINF tag specifies the duration of a Media Segment.  It applies
   only to the next Media Segment.  This tag is REQUIRED for each Media
   Segment.  Its format is:

   #EXTINF:<duration>,[<title>]

   where duration is a decimal-floating-point or decimal-integer number
   (as described in Section 4.2) that specifies the duration of the
   Media Segment in seconds.  Durations SHOULD be decimal-floating-
   point, with enough accuracy to avoid perceptible error when segment
   durations are accumulated.  However, if the compatibility version
   number is less than 3, durations MUST be integers.  Durations that
   are reported as integers SHOULD be rounded to the nearest integer.
   The remainder of the line following the comma is an optional human-
   readable informative title of the Media Segment expressed as UTF-8
   text.
   */
    public readonly '#EXTINF': MediaSegmentOptions['#EXTINF'];

    /**
    * The EXT-X-BYTERANGE tag indicates that a Media Segment is a sub-range
    of the resource identified by its URI.  It applies only to the next
    URI line that follows it in the Playlist.  Its format is:

    #EXT-X-BYTERANGE:<n>[@<o>]

    where n is a decimal-integer indicating the length of the sub-range
    in bytes.  If present, o is a decimal-integer indicating the start of
    the sub-range, as a byte offset from the beginning of the resource.
    If o is not present, the sub-range begins at the next byte following
    the sub-range of the previous Media Segment.

    If o is not present, a previous Media Segment MUST appear in the
    Playlist file and MUST be a sub-range of the same media resource, or
    the Media Segment is undefined and the client MUST fail to parse the
    Playlist.

    A Media Segment without an EXT-X-BYTERANGE tag consists of the entire
    resource identified by its URI.

    Use of the EXT-X-BYTERANGE tag REQUIRES a compatibility version
    number of 4 or greater.
    */
    public readonly '#EXT-X-BYTERANGE': MediaSegmentOptions['#EXT-X-BYTERANGE'];

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
    public readonly '#EXT-X-DISCONTINUITY': MediaSegmentOptions['#EXT-X-DISCONTINUITY'];

    /**
     * Media Segments MAY be encrypted.  The EXT-X-KEY tag specifies how to
     decrypt them.  It applies to every Media Segment and to every Media
    Initialization Section declared by an EXT-X-MAP tag that appears
    between it and the next EXT-X-KEY tag in the Playlist file with the
    same KEYFORMAT attribute (or the end of the Playlist file).  Two or
    more EXT-X-KEY tags with different KEYFORMAT attributes MAY apply to
    the same Media Segment if they ultimately produce the same decryption
    key.  The format is:

    #EXT-X-KEY:<attribute-list>

    The following attributes are defined:

        METHOD

        The value is an enumerated-string that specifies the encryption
        method.  This attribute is REQUIRED.

        The methods defined are: NONE, AES-128, and SAMPLE-AES.

        An encryption method of NONE means that Media Segments are not
        encrypted.  If the encryption method is NONE, other attributes
        MUST NOT be present.

        An encryption method of AES-128 signals that Media Segments are
        completely encrypted using the Advanced Encryption Standard (AES)
        [AES_128] with a 128-bit key, Cipher Block Chaining (CBC), and
        Public-Key Cryptography Standards #7 (PKCS7) padding [RFC5652].
        CBC is restarted on each segment boundary, using either the
        Initialization Vector (IV) attribute value or the Media Sequence
        Number as the IV; see Section 5.2.

        An encryption method of SAMPLE-AES means that the Media Segments
        contain media samples, such as audio or video, that are encrypted
        using the Advanced Encryption Standard [AES_128].  How these media
        streams are encrypted and encapsulated in a segment depends on the
        media encoding and the media format of the segment.  fMP4 Media
        Segments are encrypted using the 'cbcs' scheme of Common
        Encryption [COMMON_ENC].  Encryption of other Media Segment
        formats containing H.264 [H_264], AAC [ISO_14496], AC-3 [AC_3],
        and Enhanced AC-3 [AC_3] media streams is described in the HTTP
        Live Streaming (HLS) Sample Encryption specification [SampleEnc].
        The IV attribute MAY be present; see Section 5.2.

        URI

        The value is a quoted-string containing a URI that specifies how
        to obtain the key.  This attribute is REQUIRED unless the METHOD
        is NONE.

        IV

        The value is a hexadecimal-sequence that specifies a 128-bit
        unsigned integer Initialization Vector to be used with the key.
        Use of the IV attribute REQUIRES a compatibility version number of
        2 or greater.  See Section 5.2 for when the IV attribute is used.

        KEYFORMAT

        The value is a quoted-string that specifies how the key is
        represented in the resource identified by the URI; see Section 5
        for more detail.  This attribute is OPTIONAL; its absence
        indicates an implicit value of "identity".  Use of the KEYFORMAT
        attribute REQUIRES a compatibility version number of 5 or greater.

        KEYFORMATVERSIONS

        The value is a quoted-string containing one or more positive
        integers separated by the "/" character (for example, "1", "1/2",
        or "1/2/5").  If more than one version of a particular KEYFORMAT
        is defined, this attribute can be used to indicate which
        version(s) this instance complies with.  This attribute is
        OPTIONAL; if it is not present, its value is considered to be "1".
        Use of the KEYFORMATVERSIONS attribute REQUIRES a compatibility
        version number of 5 or greater.

    If the Media Playlist file does not contain an EXT-X-KEY tag, then
    Media Segments are not encrypted.

    See Section 5 for the format of the Key file and Sections 5.2, 6.2.3,
    and 6.3.6 for additional information on Media Segment encryption. 
    */
    public readonly '#EXT-X-KEY': MediaSegmentOptions['#EXT-X-KEY'];

    /**
     * The EXT-X-MAP tag specifies how to obtain the Media Initialization
     Section (Section 3) required to parse the applicable Media Segments.
    It applies to every Media Segment that appears after it in the
    Playlist until the next EXT-X-MAP tag or until the end of the
    Playlist.

    Its format is:

    #EXT-X-MAP:<attribute-list>

    The following attributes are defined:

        URI

        The value is a quoted-string containing a URI that identifies a
        resource that contains the Media Initialization Section.  This
        attribute is REQUIRED.

        BYTERANGE

        The value is a quoted-string specifying a byte range into the
        resource identified by the URI attribute.  This range SHOULD
        contain only the Media Initialization Section.  The format of the
        byte range is described in Section 4.3.2.2.  This attribute is
        OPTIONAL; if it is not present, the byte range is the entire
        resource indicated by the URI.

    An EXT-X-MAP tag SHOULD be supplied for Media Segments in Playlists
    with the EXT-X-I-FRAMES-ONLY tag when the first Media Segment (i.e.,
    I-frame) in the Playlist (or the first segment following an EXT-
    X-DISCONTINUITY tag) does not immediately follow the Media
    Initialization Section at the beginning of its resource.

    Use of the EXT-X-MAP tag in a Media Playlist that contains the EXT-
    X-I-FRAMES-ONLY tag REQUIRES a compatibility version number of 5 or
    greater.  Use of the EXT-X-MAP tag in a Media Playlist that DOES NOT
    contain the EXT-X-I-FRAMES-ONLY tag REQUIRES a compatibility version
    number of 6 or greater.

    If the Media Initialization Section declared by an EXT-X-MAP tag is
    encrypted with a METHOD of AES-128, the IV attribute of the EXT-X-KEY
    tag that applies to the EXT-X-MAP is REQUIRED.
    */
    public readonly '#EXT-X-MAP': MediaSegmentOptions['#EXT-X-MAP'];

    /**
     * The EXT-X-PROGRAM-DATE-TIME tag associates the first sample of a
     Media Segment with an absolute date and/or time.  It applies only to
    the next Media Segment.  Its format is:

    #EXT-X-PROGRAM-DATE-TIME:<date-time-msec>

    where date-time-msec is an ISO/IEC 8601:2004 [ISO_8601] date/time
    representation, such as YYYY-MM-DDThh:mm:ss.SSSZ.  It SHOULD indicate
    a time zone and fractional parts of seconds, to millisecond accuracy.

    For example:

    #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00

    See Sections 6.2.1 and 6.3.3 for more information on the EXT-X-
    PROGRAM-DATE-TIME tag.
    */
    public readonly '#EXT-X-PROGRAM-DATE-TIME': MediaSegmentOptions['#EXT-X-PROGRAM-DATE-TIME'];

    /**
     * The EXT-X-DATERANGE tag associates a Date Range (i.e., a range of
     time defined by a starting and ending date) with a set of attribute/
    value pairs.  Its format is:

    #EXT-X-DATERANGE:<attribute-list>

    where the defined attributes are:

        ID

        A quoted-string that uniquely identifies a Date Range in the
        Playlist.  This attribute is REQUIRED.

        CLASS

        A client-defined quoted-string that specifies some set of
        attributes and their associated value semantics.  All Date Ranges
        with the same CLASS attribute value MUST adhere to these
        semantics.  This attribute is OPTIONAL.

        START-DATE

        A quoted-string containing the ISO-8601 date at which the Date
        Range begins.  This attribute is REQUIRED.

        END-DATE

        A quoted-string containing the ISO-8601 date at which the Date
        Range ends.  It MUST be equal to or later than the value of the
        START-DATE attribute.  This attribute is OPTIONAL.

        DURATION

        The duration of the Date Range expressed as a decimal-floating-
        point number of seconds.  It MUST NOT be negative.  A single
        instant in time (e.g., crossing a finish line) SHOULD be
        represented with a duration of 0.  This attribute is OPTIONAL.

        PLANNED-DURATION

        The expected duration of the Date Range expressed as a decimal-
        floating-point number of seconds.  It MUST NOT be negative.  This
        attribute SHOULD be used to indicate the expected duration of a
        Date Range whose actual duration is not yet known.  It is
        OPTIONAL.

        X-<client-attribute>

        The "X-" prefix defines a namespace reserved for client-defined
        attributes.  The client-attribute MUST be a legal AttributeName.
        Clients SHOULD use a reverse-DNS syntax when defining their own
        attribute names to avoid collisions.  The attribute value MUST be
        a quoted-string, a hexadecimal-sequence, or a decimal-floating-
        point.  An example of a client-defined attribute is X-COM-EXAMPLE-
        AD-ID="XYZ123".  These attributes are OPTIONAL.

        SCTE35-CMD, SCTE35-OUT, SCTE35-IN

        Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
        information.  These attributes are OPTIONAL.

        END-ON-NEXT

        An enumerated-string whose value MUST be YES.  This attribute
        indicates that the end of the range containing it is equal to the
        START-DATE of its Following Range.  The Following Range is the
        Date Range of the same CLASS that has the earliest START-DATE
        after the START-DATE of the range in question.  This attribute is
        OPTIONAL.

    An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST have a
    CLASS attribute.  Other EXT-X-DATERANGE tags with the same CLASS
    attribute MUST NOT specify Date Ranges that overlap.

    An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST NOT
    contain DURATION or END-DATE attributes.

    A Date Range with neither a DURATION, an END-DATE, nor an END-ON-
    NEXT=YES attribute has an unknown duration, even if it has a PLANNED-
    DURATION.

    If a Playlist contains an EXT-X-DATERANGE tag, it MUST also contain
    at least one EXT-X-PROGRAM-DATE-TIME tag.

    If a Playlist contains two EXT-X-DATERANGE tags with the same ID
    attribute value, then any AttributeName that appears in both tags
    MUST have the same AttributeValue.

    If a Date Range contains both a DURATION attribute and an END-DATE
    attribute, the value of the END-DATE attribute MUST be equal to the
    value of the START-DATE attribute plus the value of the DURATION
    attribute.

    Clients SHOULD ignore EXT-X-DATERANGE tags with illegal syntax.
    */
    public readonly '#EXT-X-DATERANGE': MediaSegmentOptions['#EXT-X-DATERANGE'];
    public readonly 'URI': MediaSegmentOptions['URI'];

    constructor(mediaSegmentOptions: MediaSegmentOptions) {
        super();
        const errors: Error[] = [];

        // Validate each property and collect errors
        const keyErrors = validateEXTXKey(mediaSegmentOptions['#EXT-X-KEY']);
        if (keyErrors.length > 0) {
            errors.push(new Error('#EXT-X-KEY validation failed', { cause: keyErrors }));
        }
        const mapErrors = validateEXTXMap(mediaSegmentOptions['#EXT-X-MAP']);
        if (mapErrors.length > 0) {
            errors.push(new Error('#EXT-X-MAP validation failed', { cause: mapErrors }));
        }
        const programDateTimeErrors = validateEXTXProgramDateTime(
            mediaSegmentOptions['#EXT-X-PROGRAM-DATE-TIME'],
        );
        if (programDateTimeErrors.length > 0) {
            errors.push(
                new Error('#EXT-X-PROGRAM-DATE-TIME validation failed', {
                    cause: programDateTimeErrors,
                }),
            );
        }
        const daterangeErrors = validateEXTXDaterange(mediaSegmentOptions['#EXT-X-DATERANGE']);
        if (daterangeErrors.length > 0) {
            errors.push(
                new Error('#EXT-X-DATERANGE validation failed', { cause: daterangeErrors }),
            );
        }

        if (errors.length > 0) {
            this.error = new Error('MediaSegment validation failed', { cause: errors });
        }

        this['#EXTINF'] = mediaSegmentOptions['#EXTINF'];
        this['#EXT-X-BYTERANGE'] = mediaSegmentOptions['#EXT-X-BYTERANGE'];
        this['#EXT-X-DISCONTINUITY'] = mediaSegmentOptions['#EXT-X-DISCONTINUITY'];
        this['#EXT-X-KEY'] = mediaSegmentOptions['#EXT-X-KEY'];
        this['#EXT-X-MAP'] = mediaSegmentOptions['#EXT-X-MAP'];
        this['#EXT-X-PROGRAM-DATE-TIME'] = mediaSegmentOptions['#EXT-X-PROGRAM-DATE-TIME'];
        this['#EXT-X-DATERANGE'] = mediaSegmentOptions['#EXT-X-DATERANGE'];
        this['URI'] = mediaSegmentOptions['URI'];
    }

    public *toHLSLines() {
        if (this['#EXT-X-BYTERANGE']) {
            yield stringifyEXTXByterange(this['#EXT-X-BYTERANGE']);
        }
        if (this['#EXT-X-DISCONTINUITY']) {
            yield stringifyEXTXDiscontinuity();
        }
        if (this['#EXT-X-KEY']) {
            yield stringifyEXTXKey(this['#EXT-X-KEY']);
        }
        if (this['#EXT-X-MAP']) {
            yield stringifyEXTXMap(this['#EXT-X-MAP']);
        }
        if (this['#EXT-X-PROGRAM-DATE-TIME']) {
            yield stringifyEXTXProgramDateTime(this['#EXT-X-PROGRAM-DATE-TIME']);
        }
        if (this['#EXT-X-DATERANGE']) {
            yield stringifyEXTXDaterange(this['#EXT-X-DATERANGE']);
        }
        yield stringifyEXTINF(this['#EXTINF']);
        yield this['URI'];
    }

    public toHLS(): string {
        return Array.from(this.toHLSLines()).join('\n');
    }

    public toJSON() {
        return {
            '#EXTINF': this['#EXTINF'],
            '#EXT-X-BYTERANGE': this['#EXT-X-BYTERANGE'],
            '#EXT-X-DISCONTINUITY': this['#EXT-X-DISCONTINUITY'],
            '#EXT-X-KEY': this['#EXT-X-KEY'],
            '#EXT-X-MAP': this['#EXT-X-MAP'],
            '#EXT-X-PROGRAM-DATE-TIME': this['#EXT-X-PROGRAM-DATE-TIME'],
            '#EXT-X-DATERANGE': this['#EXT-X-DATERANGE'],
            URI: this['URI'],
        };
    }
}
