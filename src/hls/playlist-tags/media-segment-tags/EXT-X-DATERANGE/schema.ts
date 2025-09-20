import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-DATERANGE' as const;
export const EXT_X_DATERANGE_STRING = z.templateLiteral([TAG, ':', z.string()]);

const EXT_X_DATERANGE_OBJECT = z
    .object({
        /**
         * A quoted-string that uniquely identifies a Date Range in the Playlist. This attribute is REQUIRED.
         */
        ID: z.string(),
        /**
         * A client-defined quoted-string that specifies some set of attributes and their associated value semantics. All Date Ranges with the same CLASS attribute value MUST adhere to these semantics. This attribute is OPTIONAL.
         */
        CLASS: z.string().optional(),
        /**
         * A quoted-string containing the ISO-8601 date at which the Date Range begins. This attribute is REQUIRED.
         */
        'START-DATE': z.iso.datetime(),
        /**
         * A quoted-string containing the ISO-8601 date at which the Date Range ends. It MUST be equal to or later than the value of the START-DATE attribute. This attribute is OPTIONAL.
         */
        'END-DATE': z.iso.datetime().optional(),
        /**
         * The duration of the Date Range expressed as a decimal-floating-point number of seconds. It MUST NOT be negative. A single instant in time (e.g., crossing a finish line) SHOULD be represented with a duration of 0. This attribute is OPTIONAL.
         */
        DURATION: z.coerce.number().positive().optional(),
        /**
         * The expected duration of the Date Range expressed as a decimal-floating-point number of seconds. It MUST NOT be negative. This attribute SHOULD be used to indicate the expected duration of a Date Range whose actual duration is not yet known. It is OPTIONAL.
         */
        'PLANNED-DURATION': z.coerce.number().positive().optional(),
        /**
         * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more information. These attributes are OPTIONAL.
         */
        'SCTE35-CMD': z.string().optional(),
        /**
         * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more information. These attributes are OPTIONAL.
         */
        'SCTE35-OUT': z.string().optional(),
        /**
         * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more information. These attributes are OPTIONAL.
         */
        'SCTE35-IN': z.string().optional(),
        /**
         * An enumerated-string whose value MUST be YES. This attribute indicates that the end of the range containing it is equal to the START-DATE of its Following Range. The Following Range is the Date Range of the same CLASS that has the earliest START-DATE after the START-DATE of the range in question. This attribute is OPTIONAL.
         */
        'END-ON-NEXT': z.literal('YES').optional(),
    })
    .readonly();

/**
   The EXT-X-DATERANGE tag associates a Date Range (i.e., a range of
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

4.3.2.7.1.  Mapping SCTE-35 into EXT-X-DATERANGE

   Splice information carried in source media according to the SCTE-35
   specification [SCTE35] MAY be represented in a Media Playlist using
   EXT-X-DATERANGE tags.

   Each SCTE-35 splice_info_section() containing a splice_null(),
   splice_schedule(), bandwidth_reservation(), or private_cmd() SHOULD
   be represented by an EXT-X-DATERANGE tag with an SCTE35-CMD attribute
   whose value is the big-endian binary representation of the
   splice_info_section(), expressed as a hexadecimal-sequence.

   An SCTE-35 splice out/in pair signaled by a pair of splice_insert()
   commands SHOULD be represented by one or more EXT-X-DATERANGE tags
   carrying the same ID attribute, which MUST be unique to that splice
   out/in pair.  The "out" splice_info_section() (with
   out_of_network_indicator set to 1) MUST be placed in an SCTE35-OUT
   attribute, with the same formatting as SCTE35-CMD.  The "in"
   splice_info_section() (with out_of_network_indicator set to 0) MUST
   be placed in an SCTE35-IN attribute, with the same formatting as
   SCTE35-CMD.

   An SCTE-35 splice out/in pair signaled by a pair of time_signal()
   commands, each carrying a single segmentation_descriptor(), SHOULD be
   represented by one or more EXT-X-DATERANGE tags carrying the same ID
   attribute, which MUST be unique to that splice out/in pair.  The

   "out" splice_info_section() MUST be placed in an SCTE35-OUT
   attribute; the "in" splice_info_section() MUST be placed in an
   SCTE35-IN attribute.

   Different types of segmentation, as indicated by the
   segmentation_type_id in the segmentation_descriptor(), SHOULD be
   represented by separate EXT-X-DATERANGE tags, even if two or more
   segmentation_descriptor()s arrive in the same splice_info_section().
   In that case, each EXT-X-DATERANGE tag will have an SCTE35-OUT,
   SCTE35-IN, or SCTE35-CMD attribute whose value is the entire
   splice_info_section().

   An SCTE-35 time_signal() command that does not signal a splice out or
   in point SHOULD be represented by an EXT-X-DATERANGE tag with an
   SCTE35-CMD attribute.

   The START-DATE of an EXT-X-DATERANGE tag containing an SCTE35-OUT
   attribute MUST be the date and time that corresponds to the program
   time of that splice.

   The START-DATE of an EXT-X-DATERANGE tag containing an SCTE35-CMD
   MUST be the date and time specified by the splice_time() in the
   command or the program time at which the command appeared in the
   source stream if the command does not specify a splice_time().

   An EXT-X-DATERANGE tag containing an SCTE35-OUT attribute MAY contain
   a PLANNED-DURATION attribute.  Its value MUST be the planned duration
   of the splice.

   The DURATION of an EXT-X-DATERANGE tag containing an SCTE35-IN
   attribute MUST be the actual (not planned) program duration between
   the corresponding out-point and that in-point.

   The END-DATE of an EXT-X-DATERANGE tag containing an SCTE35-IN
   attribute MUST be the actual (not planned) program date and time of
   that in-point.

   If the actual end date and time is not known when an SCTE35-OUT
   attribute is added to the Playlist, the DURATION attribute and the
   END-TIME attribute MUST NOT be present; the actual end date of the
   splice SHOULD be signaled by another EXT-X-DATERANGE tag once it has
   been established.

   A canceled splice SHOULD NOT appear in the Playlist as an EXT-
   X-DATERANGE tag.

   An EXT-X-DATERANGE tag announcing a splice SHOULD be added to a
   Playlist at the same time as the last pre-splice Media Segment, or
   earlier if possible.

   The ID attribute of an EXT-X-DATERANGE tag MAY contain a
   splice_event_id and/or a segmentation_event_id, but it MUST be unique
   in the Playlist.  If there is a possibility that an SCTE-35 id will
   be reused, the ID attribute value MUST include disambiguation, such
   as a date or sequence number.
*/

export const EXT_X_DATERANGE_CODEC = z.codec(EXT_X_DATERANGE_STRING, EXT_X_DATERANGE_OBJECT, {
    decode: (value) => fromAttributeList(stripTag(value)),
    encode: (obj) => {
        const preEncoded: Record<string, unknown> = {
            ...obj,
        };

        if (obj['ID']) {
            preEncoded['ID'] = `"${obj['ID']}"`;
        }

        if (obj['CLASS']) {
            preEncoded['CLASS'] = `"${obj['CLASS']}"`;
        }

        if (obj['END-ON-NEXT']) {
            preEncoded['END-ON-NEXT'] = '"YES"';
        }

        if (obj['START-DATE']) {
            preEncoded['START-DATE'] = `"${obj['START-DATE']}"`;
        }

        if (obj['END-DATE']) {
            preEncoded['END-DATE'] = `"${obj['END-DATE']}"`;
        }

        return `${TAG}:${toAttributeList(preEncoded)}` as any;
    },
});
