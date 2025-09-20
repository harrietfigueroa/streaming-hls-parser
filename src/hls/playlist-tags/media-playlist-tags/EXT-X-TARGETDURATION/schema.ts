import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-TARGETDURATION' as const;
export const EXT_X_TARGETDURATION_STRING = z.templateLiteral([
    TAG,
    ':',
    z.number().int().positive(),
]);

/**
 * The EXT-X-TARGETDURATION tag specifies the maximum Media Segment
 * duration. The EXTINF duration of each Media Segment in the Playlist
 * file, when rounded to the nearest integer, MUST be less than or equal
 * to the target duration; longer segments can trigger playback stalls
 * or other errors. It applies to the entire Playlist file.
 *
 * Its format is:
 *
 * #EXT-X-TARGETDURATION:<s>
 *
 * where s is a decimal-integer indicating the target duration in
 * seconds. The EXT-X-TARGETDURATION tag is REQUIRED.
 */
export const EXT_X_TARGETDURATION_OBJECT = z.number().int().positive().describe(`
    The EXT-X-TARGETDURATION tag specifies the maximum Media Segment
    duration. The EXTINF duration of each Media Segment in the Playlist
    file, when rounded to the nearest integer, MUST be less than or equal
    to the target duration; longer segments can trigger playback stalls
    or other errors. It applies to the entire Playlist file.

    Its format is:

    #EXT-X-TARGETDURATION:<s>

    where s is a decimal-integer indicating the target duration in
    seconds. The EXT-X-TARGETDURATION tag is REQUIRED.
`);

export const EXT_X_TARGETDURATION_CODEC = z.codec(
    EXT_X_TARGETDURATION_STRING,
    EXT_X_TARGETDURATION_OBJECT,
    {
        decode: (value) => {
            return +stripTag(value);
        },
        encode: (duration) => {
            return `${TAG}:${duration}` as any;
        },
    },
);

export type EXT_X_TARGETDURATION_STRING_TYPE = `#EXT-X-TARGETDURATION:${number}`;
