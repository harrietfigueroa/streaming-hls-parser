import * as z from 'zod';

export const TAG = '#EXT-X-BITRATE' as const;
export const EXT_X_BITRATE_STRING = z.string().startsWith(`${TAG}:`);

/**
 * The EXT-X-BITRATE tag identifies the approximate segment bit rate of
 * the Media Segment(s) to which it applies.
 *
 * Its format is:
 *
 * #EXT-X-BITRATE:<rate>
 *
 * where rate is a decimal-integer of kilobits per second. This tag
 * applies to every Media Segment between it and the next EXT-X-BITRATE
 * tag in the Playlist file (or the end of the Playlist file) that does
 * not have an EXT-X-BYTERANGE tag applied to it.
 *
 * The EXT-X-BITRATE tag is optional. The rate value must be within
 * 90-110% accuracy of the actual segment bit rates.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.4.8
 */
export const EXT_X_BITRATE_OBJECT = z.coerce.number().int().positive().describe(`
    The EXT-X-BITRATE tag identifies the approximate segment bit rate of
    the Media Segment(s) to which it applies.

    Its format is:

    #EXT-X-BITRATE:<rate>

    where rate is a decimal-integer of kilobits per second. This tag
    applies to every Media Segment between it and the next EXT-X-BITRATE
    tag in the Playlist file (or the end of the Playlist file) that does
    not have an EXT-X-BYTERANGE tag applied to it.

    The EXT-X-BITRATE tag is optional. The rate value must be within
    90-110% accuracy of the actual segment bit rates.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.4.8
`).readonly();

export const EXT_X_BITRATE_CODEC = z.codec(EXT_X_BITRATE_STRING, EXT_X_BITRATE_OBJECT, {
    decode: (value) => {
        const parts = value.split(':');
        return parseInt(parts[1], 10);
    },
    encode: (obj) => {
        return `${TAG}:${obj}` as any;
    },
});

export type EXT_X_BITRATE_STRING_TYPE = `#EXT-X-BITRATE:${number}`;
