import * as z from 'zod';

export const TAG = '#EXT-X-SPLICEPOINT-SCTE35' as const;

/**
 * The EXT-X-SPLICEPOINT-SCTE35 tag carries SCTE-35 splice information
 * encoded as a base64 string. This tag is used in HLS streams to signal
 * ad insertion opportunities using the SCTE-35 standard.
 *
 * Its format is:
 *
 * #EXT-X-SPLICEPOINT-SCTE35:<base64-encoded-payload>
 *
 * The base64 payload contains the binary splice_info_section from the
 * SCTE-35 specification. The payload includes markers:
 * - 0x34: Cue-out marker (start of ad break)
 * - 0x35: Cue-in marker (end of ad break)
 *
 * Example:
 * #EXT-X-SPLICEPOINT-SCTE35:/DA9AAAAAAAAAP/wBQb+uYbZqwAnAiVDVVVJAAAKqX//...
 *
 * The EXT-X-SPLICEPOINT-SCTE35 tag applies to the next Media Segment and
 * provides the raw SCTE-35 data that can be used by ad insertion systems
 * to determine splice points and ad placement.
 *
 * This tag is commonly used in broadcast and live streaming workflows
 * where SCTE-35 signals are embedded in the transport stream and need
 * to be preserved in the HLS manifest.
 *
 * Reference: SCTE-35 Digital Program Insertion Cueing Message
 * https://www.scte.org/standards/library/catalog/scte-35-digital-program-insertion-cueing-message/
 */
export const EXT_X_SPLICEPOINT_SCTE35_STRING = z.string().startsWith(TAG);

export const EXT_X_SPLICEPOINT_SCTE35_OBJECT = z
    .object({
        payload: z.string(), // Base64-encoded SCTE-35 binary data
    })
    .describe(`
    The EXT-X-SPLICEPOINT-SCTE35 tag carries SCTE-35 splice information
    encoded as a base64 string. This tag is used in HLS streams to signal
    ad insertion opportunities using the SCTE-35 standard.

    Its format is:

    #EXT-X-SPLICEPOINT-SCTE35:<base64-encoded-payload>

    The base64 payload contains the binary splice_info_section from the
    SCTE-35 specification. The payload includes markers:
    - 0x34: Cue-out marker (start of ad break)
    - 0x35: Cue-in marker (end of ad break)

    Example:
    #EXT-X-SPLICEPOINT-SCTE35:/DA9AAAAAAAAAP/wBQb+uYbZqwAnAiVDVVVJAAAKqX//...

    The EXT-X-SPLICEPOINT-SCTE35 tag applies to the next Media Segment and
    provides the raw SCTE-35 data that can be used by ad insertion systems
    to determine splice points and ad placement.

    This tag is commonly used in broadcast and live streaming workflows
    where SCTE-35 signals are embedded in the transport stream and need
    to be preserved in the HLS manifest.

    Reference: SCTE-35 Digital Program Insertion Cueing Message
    https://www.scte.org/standards/library/catalog/scte-35-digital-program-insertion-cueing-message/
`);

export const EXT_X_SPLICEPOINT_SCTE35_CODEC = z.codec(
    EXT_X_SPLICEPOINT_SCTE35_STRING,
    EXT_X_SPLICEPOINT_SCTE35_OBJECT,
    {
        decode: (value) => {
            // Extract the base64 payload after the tag and colon
            const payload = value.substring(TAG.length + 1).trim();

            return {
                payload: payload,
            };
        },
        encode: (obj) => {
            return `${TAG}:${obj.payload}` as any;
        },
    },
);

export type EXT_X_SPLICEPOINT_SCTE35_STRING_TYPE = `#EXT-X-SPLICEPOINT-SCTE35:${string}`;
