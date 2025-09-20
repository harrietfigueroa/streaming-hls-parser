import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

const TAG = '#EXT-X-BYTERANGE' as const;
export const EXT_X_BYTERANGE_STRING = z.union([
    z.templateLiteral([TAG, ':', z.number()]),
    z.templateLiteral([TAG, ':', z.number(), '@', z.number()]),
]);

export const EXT_X_BYTERANGE = z.object({
    n: z.number().int().positive(),
    o: z.number().int().positive().optional(),
});

/**
 *  The EXT-X-BYTERANGE tag indicates that a Media Segment is a sub-range
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
export const EXT_X_BYTERANGE_CODEC = z.codec(EXT_X_BYTERANGE_STRING, EXT_X_BYTERANGE, {
    decode: (value) => {
        const stripped = stripTag(value);
        if (stripped.includes('@')) {
            const [n, o] = stripped.split('@');
            return { n: +n, o: +o };
        }
        return { n: +stripped };
    },
    encode: (value) => {
        if (value.o) {
            return `${TAG}:${value.n}@${value.o}` as const;
        }
        return `${TAG}:${value.n}` as const;
    },
});
