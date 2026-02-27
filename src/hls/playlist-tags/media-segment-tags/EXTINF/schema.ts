import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXTINF' as const;
export const EXTINF_STRING = z.templateLiteral([TAG, ':', z.string()]);

/**
 * The EXTINF tag specifies the duration of a Media Segment.  It applies
 * only to the next Media Segment.  This tag is REQUIRED for each Media
 * Segment.  Its format is:
 *
 * #EXTINF:<duration>,[<title>]
 *
 * where duration is a decimal-floating-point or decimal-integer number
 * (as described in Section 4.2) that specifies the duration of the
 * Media Segment in seconds.  Durations SHOULD be decimal-floating-
 * point, with enough accuracy to avoid perceptible error when segment
 * durations are accumulated.  However, if the compatibility version
 * number is less than 3, durations MUST be integers.  Durations that
 * are reported as integers SHOULD be rounded to the nearest integer.
 * The remainder of the line following the comma is an optional human-
 * readable informative title of the Media Segment expressed as UTF-8
 * text.
 */
export const EXTINF_OBJECT = z
    .object({
        /**
         * DURATION
         * The duration of the Media Segment in seconds. Must be a non-negative number.
         */
        DURATION: z.number().min(0, 'DURATION must be non-negative'),

        /**
         * TITLE
         * An optional human-readable informative title of the Media Segment
         * expressed as UTF-8 text.
         */
        TITLE: z.string().optional(),
    })
    .readonly();

export const EXTINF_CODEC = z.codec(EXTINF_STRING, EXTINF_OBJECT, {
    decode: (value) => {
        const content = stripTag(value);

        // Parse duration and optional title
        const commaIndex = content.indexOf(',');
        let duration: number;
        let title: string | undefined;

        if (commaIndex === -1) {
            // No comma, just duration
            duration = parseFloat(content);
        } else {
            // Has comma, parse duration and title
            const durationStr = content.substring(0, commaIndex);
            duration = parseFloat(durationStr);

            const titleStr = content.substring(commaIndex + 1);
            title = titleStr || undefined;
        }

        return {
            DURATION: duration,
            TITLE: title,
        };
    },
    encode: (obj) => {
        if (obj.TITLE !== undefined) {
            return `${TAG}:${obj.DURATION},${obj.TITLE}` as any;
        } else {
            return `${TAG}:${obj.DURATION}` as any;
        }
    },
});

export type EXTINF_STRING_TYPE = `#EXTINF:${string}`;
