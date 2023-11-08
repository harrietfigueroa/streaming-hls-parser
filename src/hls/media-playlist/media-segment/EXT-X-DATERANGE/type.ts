import {
    AttributeDecimalFloatingPointValue,
    AttributeHexValue,
    AttributeQuotedString,
} from '../../../common/attribute-list';

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
export type DateRange = `#EXT-X-DATERANGE:${string}`;

export interface DateRangeAttributes {
    /**
     * A quoted-string that uniquely identifies a Date Range in the
      Playlist.  This attribute is REQUIRED.
     */
    ID: AttributeQuotedString;

    /**
     * A client-defined quoted-string that specifies some set of
      attributes and their associated value semantics.  All Date Ranges
      with the same CLASS attribute value MUST adhere to these
      semantics.  This attribute is OPTIONAL.
     */
    CLASS?: AttributeQuotedString;

    /**
     * A quoted-string containing the ISO-8601 date at which the Date
      Range begins.  This attribute is REQUIRED.
     */
    'START-DATE': string;

    /**
     * A quoted-string containing the ISO-8601 date at which the Date
      Range ends.  It MUST be equal to or later than the value of the
      START-DATE attribute.  This attribute is OPTIONAL.
     */
    'END-DATE'?: string;

    /**
     * The duration of the Date Range expressed as a decimal-floating-
      point number of seconds.  It MUST NOT be negative.  A single
      instant in time (e.g., crossing a finish line) SHOULD be
      represented with a duration of 0.  This attribute is OPTIONAL.
     */
    DURATION?: number;

    /**
     * The expected duration of the Date Range expressed as a decimal-
      floating-point number of seconds.  It MUST NOT be negative.  This
      attribute SHOULD be used to indicate the expected duration of a
      Date Range whose actual duration is not yet known.  It is
      OPTIONAL.
     */
    'PLANNED-DURATION'?: number;

    /**
     * The "X-" prefix defines a namespace reserved for client-defined
      attributes.  The client-attribute MUST be a legal AttributeName.
      Clients SHOULD use a reverse-DNS syntax when defining their own
      attribute names to avoid collisions.  The attribute value MUST be
      a quoted-string, a hexadecimal-sequence, or a decimal-floating-
      point.  An example of a client-defined attribute is X-COM-EXAMPLE-
      AD-ID="XYZ123".  These attributes are OPTIONAL.
     */
    [clientAttribute: `X-${string}`]:
        | AttributeQuotedString
        | AttributeHexValue
        | AttributeDecimalFloatingPointValue;

    /**
     * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
      information.  These attributes are OPTIONAL.
     */
    'SCTE-CMD': any;

    /**
     * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
      information.  These attributes are OPTIONAL.
     */
    'SCTE-OUT': any;

    /**
     * Used to carry SCTE-35 data; see Section 4.3.2.7.1 for more
      information.  These attributes are OPTIONAL.
     */
    'SCTE-IN': any;

    /**
     * An enumerated-string whose value MUST be YES.  This attribute
      indicates that the end of the range containing it is equal to the
      START-DATE of its Following Range.  The Following Range is the
      Date Range of the same CLASS that has the earliest START-DATE
      after the START-DATE of the range in question.  This attribute is
      OPTIONAL.
     */
    'END-ON-NEXT'?: 'YES';
}
