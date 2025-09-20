import * as z from 'zod';

export const TAG = '#EXTM3U' as const;
export const EXTM3U_STRING = z.templateLiteral([TAG]);

/**
 * The EXTM3U tag indicates that the Playlist file is an Extended M3U
 * Playlist file. This tag MUST be the first line of every Extended M3U
 * Playlist file.
 *
 * Its format is:
 *
 * #EXTM3U
 *
 * The EXTM3U tag is required. It MUST appear on the first line of the
 * Playlist file. If the first line of a Playlist file does not begin
 * with #EXTM3U, then the client MUST treat the file as a basic M3U
 * Playlist file.
 */
export const EXTM3U_OBJECT = z.literal(true).describe(`
    The EXTM3U tag indicates that the Playlist file is an Extended M3U
    Playlist file. This tag MUST be the first line of every Extended M3U
    Playlist file.

    Its format is:

    #EXTM3U

    The EXTM3U tag is required. It MUST appear on the first line of the
    Playlist file. If the first line of a Playlist file does not begin
    with #EXTM3U, then the client MUST treat the file as a basic M3U
    Playlist file.
`);

export const EXTM3U_CODEC = z.codec(EXTM3U_STRING, EXTM3U_OBJECT, {
    decode: (value) => {
        return true as const;
    },
    encode: (obj) => {
        return TAG as any;
    },
});

export type EXTM3U_STRING_TYPE = '#EXTM3U';
