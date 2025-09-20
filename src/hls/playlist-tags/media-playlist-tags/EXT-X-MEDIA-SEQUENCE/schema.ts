import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-MEDIA-SEQUENCE' as const;
export const EXT_X_MEDIA_SEQUENCE_STRING = z.templateLiteral([TAG, ':', z.number().int().min(0)]);

/**
 * The EXT-X-MEDIA-SEQUENCE tag indicates the Media Sequence Number of
 * the first Media Segment that appears in a Playlist file.
 *
 * Its format is:
 *
 * #EXT-X-MEDIA-SEQUENCE:<number>
 *
 * where number is a decimal-integer.
 *
 * If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE
 * tag, then the Media Sequence Number of the first Media Segment in the
 * Media Playlist SHALL be considered to be 0. A client MUST NOT assume
 * that segments with the same Media Sequence Number in different Media
 * Playlists contain matching content (see Section 6.3.2).
 *
 * The EXT-X-MEDIA-SEQUENCE tag is optional.
 */
export const EXT_X_MEDIA_SEQUENCE_OBJECT = z.number().int().min(0).describe(`
    The EXT-X-MEDIA-SEQUENCE tag indicates the Media Sequence Number of
    the first Media Segment that appears in a Playlist file.

    Its format is:

    #EXT-X-MEDIA-SEQUENCE:<number>

    where number is a decimal-integer.

    If the Media Playlist file does not contain an EXT-X-MEDIA-SEQUENCE
    tag, then the Media Sequence Number of the first Media Segment in the
    Media Playlist SHALL be considered to be 0. A client MUST NOT assume
    that segments with the same Media Sequence Number in different Media
    Playlists contain matching content (see Section 6.3.2).

    The EXT-X-MEDIA-SEQUENCE tag is optional.
`);

export const EXT_X_MEDIA_SEQUENCE_CODEC = z.codec(
    EXT_X_MEDIA_SEQUENCE_STRING,
    EXT_X_MEDIA_SEQUENCE_OBJECT,
    {
        decode: (value) => {
            return +stripTag(value);
        },
        encode: (sequence) => {
            return `${TAG}:${sequence}` as any;
        },
    },
);

export type EXT_X_MEDIA_SEQUENCE_STRING_TYPE = `#EXT-X-MEDIA-SEQUENCE:${number}`;
