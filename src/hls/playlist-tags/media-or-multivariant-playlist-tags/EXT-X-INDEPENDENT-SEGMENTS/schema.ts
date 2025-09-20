import * as z from 'zod';

export const TAG = '#EXT-X-INDEPENDENT-SEGMENTS' as const;
export const EXT_X_INDEPENDENT_SEGMENTS_STRING = z.templateLiteral([TAG]);

/**
 * The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples
 * in a Media Segment can be decoded without information from other
 * segments. It applies to every Media Segment in the Playlist.
 *
 * Its format is:
 *
 * #EXT-X-INDEPENDENT-SEGMENTS
 *
 * The EXT-X-INDEPENDENT-SEGMENTS tag is optional. It applies to every
 * Media Segment in the Playlist. If the EXT-X-INDEPENDENT-SEGMENTS tag
 * is present, all media samples in a Media Segment can be decoded
 * without information from other segments.
 *
 * The EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once
 * in a Playlist file.
 */
export const EXT_X_INDEPENDENT_SEGMENTS_OBJECT = z.literal(true).describe(`
    The EXT-X-INDEPENDENT-SEGMENTS tag indicates that all media samples
    in a Media Segment can be decoded without information from other
    segments. It applies to every Media Segment in the Playlist.

    Its format is:

    #EXT-X-INDEPENDENT-SEGMENTS

    The EXT-X-INDEPENDENT-SEGMENTS tag is optional. It applies to every
    Media Segment in the Playlist. If the EXT-X-INDEPENDENT-SEGMENTS tag
    is present, all media samples in a Media Segment can be decoded
    without information from other segments.

    The EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once
    in a Playlist file.
`);

export const EXT_X_INDEPENDENT_SEGMENTS_CODEC = z.codec(
    EXT_X_INDEPENDENT_SEGMENTS_STRING,
    EXT_X_INDEPENDENT_SEGMENTS_OBJECT,
    {
        decode: () => {
            return true as const;
        },
        encode: () => {
            return TAG as any;
        },
    },
);

export type EXT_X_INDEPENDENT_SEGMENTS_STRING_TYPE = '#EXT-X-INDEPENDENT-SEGMENTS';
