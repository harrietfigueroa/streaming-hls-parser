import * as z from 'zod';

export const TAG = '#EXT-X-ENDLIST' as const;
export const EXT_X_ENDLIST_STRING = z.templateLiteral([TAG]);

/**
 * The EXT-X-ENDLIST tag indicates that no more Media Segments will be
 * added to the Media Playlist file. It MAY occur anywhere in the Media
 * Playlist file.
 *
 * Its format is:
 *
 * #EXT-X-ENDLIST
 *
 * The EXT-X-ENDLIST tag is optional. It indicates that no more Media
 * Segments will be added to the Media Playlist file. It MAY occur
 * anywhere in the Media Playlist file.
 */
export const EXT_X_ENDLIST_OBJECT = z.literal(true).describe(`
    The EXT-X-ENDLIST tag indicates that no more Media Segments will be
    added to the Media Playlist file. It MAY occur anywhere in the Media
    Playlist file.

    Its format is:

    #EXT-X-ENDLIST

    The EXT-X-ENDLIST tag is optional. It indicates that no more Media
    Segments will be added to the Media Playlist file. It MAY occur
    anywhere in the Media Playlist file.
`);

export const EXT_X_ENDLIST_CODEC = z.codec(EXT_X_ENDLIST_STRING, EXT_X_ENDLIST_OBJECT, {
    decode: () => {
        return true as const;
    },
    encode: () => {
        return TAG as any;
    },
});

export type EXT_X_ENDLIST_STRING_TYPE = '#EXT-X-ENDLIST';
