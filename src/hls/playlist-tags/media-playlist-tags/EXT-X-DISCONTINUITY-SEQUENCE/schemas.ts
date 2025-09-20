import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-DISCONTINUITY-SEQUENCE' as const;
export const EXT_X_DISCONTINUITY_SEQUENCE_STRING = z.templateLiteral([
    TAG,
    ':',
    z.number().int().min(0),
]);

/**
 * The EXT-X-DISCONTINUITY-SEQUENCE tag allows synchronization between
 * different Renditions of the same Variant Stream or different Variant
 * Streams that have EXT-X-DISCONTINUITY tags in their Media Playlists.
 *
 * Its format is:
 *
 * #EXT-X-DISCONTINUITY-SEQUENCE:<number>
 *
 * where number is a decimal-integer.
 *
 * If the Media Playlist does not contain an EXT-X-DISCONTINUITY-
 * SEQUENCE tag, then the Discontinuity Sequence Number of the first
 * Media Segment in the Playlist SHALL be considered to be 0.
 *
 * The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first
 * Media Segment in the Playlist.
 *
 * The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-
 * X-DISCONTINUITY tag.
 *
 * See Sections 6.2.1 and 6.2.2 for more information about setting the
 * value of the EXT-X-DISCONTINUITY-SEQUENCE tag.
 *
 * The EXT-X-DISCONTINUITY-SEQUENCE tag is optional.
 */
export const EXT_X_DISCONTINUITY_SEQUENCE_OBJECT = z.number().int().min(0).describe(`
    The EXT-X-DISCONTINUITY-SEQUENCE tag allows synchronization between
    different Renditions of the same Variant Stream or different Variant
    Streams that have EXT-X-DISCONTINUITY tags in their Media Playlists.

    Its format is:

    #EXT-X-DISCONTINUITY-SEQUENCE:<number>

    where number is a decimal-integer.

    If the Media Playlist does not contain an EXT-X-DISCONTINUITY-
    SEQUENCE tag, then the Discontinuity Sequence Number of the first
    Media Segment in the Playlist SHALL be considered to be 0.

    The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first
    Media Segment in the Playlist.

    The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before any EXT-
    X-DISCONTINUITY tag.

    See Sections 6.2.1 and 6.2.2 for more information about setting the
    value of the EXT-X-DISCONTINUITY-SEQUENCE tag.

    The EXT-X-DISCONTINUITY-SEQUENCE tag is optional.
`);

export const EXT_X_DISCONTINUITY_SEQUENCE_CODEC = z.codec(
    EXT_X_DISCONTINUITY_SEQUENCE_STRING,
    EXT_X_DISCONTINUITY_SEQUENCE_OBJECT,
    {
        decode: (value) => {
            return +stripTag(value);
        },
        encode: (sequence) => {
            return `${TAG}:${sequence}` as any;
        },
    },
);

export type EXT_X_DISCONTINUITY_SEQUENCE_STRING_TYPE = `#EXT-X-DISCONTINUITY-SEQUENCE:${number}`;
