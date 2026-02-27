import * as z from 'zod';

export const TAG = '#EXT-X-SKIP' as const;

/**
 * The EXT-X-SKIP tag is used in Playlist Delta Updates to indicate that
 * certain segments have been removed from the playlist and can be skipped.
 *
 * Its format is:
 *
 * #EXT-X-SKIP:<attribute-list>
 *
 * The following attributes are defined:
 *
 * SKIPPED-SEGMENTS: The number of Media Segments that have been removed
 *   from the start of the playlist. REQUIRED.
 * RECENTLY-REMOVED-DATERANGES: A quoted-string containing a tab-separated
 *   list of EXT-X-DATERANGE IDs that have been removed from the playlist.
 *
 * This tag is used in Media Playlists to optimize playlist delta updates
 * by indicating segments that have been removed since the last playlist
 * version.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.5.2
 */
export const EXT_X_SKIP_STRING = z.string().startsWith(TAG);

export const EXT_X_SKIP_OBJECT = z
    .object({
        'SKIPPED-SEGMENTS': z.coerce.number().int(),
        'RECENTLY-REMOVED-DATERANGES': z.string().optional(),
    })
    .describe(`
    The EXT-X-SKIP tag is used in Playlist Delta Updates to indicate that
    certain segments have been removed from the playlist and can be skipped.

    Its format is:

    #EXT-X-SKIP:<attribute-list>

    The following attributes are defined:

    SKIPPED-SEGMENTS: The number of Media Segments that have been removed
      from the start of the playlist. REQUIRED.
    RECENTLY-REMOVED-DATERANGES: A quoted-string containing a tab-separated
      list of EXT-X-DATERANGE IDs that have been removed from the playlist.

    This tag is used in Media Playlists to optimize playlist delta updates
    by indicating segments that have been removed since the last playlist
    version.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.5.2
`);

export const EXT_X_SKIP_CODEC = z.codec(EXT_X_SKIP_STRING, EXT_X_SKIP_OBJECT, {
    decode: (value) => {
        // TODO: Implement proper attribute list parsing
        const attributeListString = value.substring(TAG.length + 1);
        const result: any = {};

        const parts = attributeListString.split(',');
        parts.forEach((part) => {
            const [key, val] = part.split('=');
            if (key && val) {
                const trimmedKey = key.trim();
                const trimmedVal = val.replace(/^"|"$/g, '').trim();
                if (trimmedKey === 'SKIPPED-SEGMENTS') {
                    result[trimmedKey] = parseInt(trimmedVal, 10);
                } else {
                    result[trimmedKey] = trimmedVal;
                }
            }
        });

        return result;
    },
    encode: (obj) => {
        // TODO: Implement proper attribute list encoding
        const attrs: string[] = [];
        if (obj['SKIPPED-SEGMENTS'] !== undefined) attrs.push(`SKIPPED-SEGMENTS=${obj['SKIPPED-SEGMENTS']}`);
        if (obj['RECENTLY-REMOVED-DATERANGES'])
            attrs.push(`RECENTLY-REMOVED-DATERANGES="${obj['RECENTLY-REMOVED-DATERANGES']}"`);
        return `${TAG}:${attrs.join(',')}` as any;
    },
});

export type EXT_X_SKIP_STRING_TYPE = `#EXT-X-SKIP:${string}`;
