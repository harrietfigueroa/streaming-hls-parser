import * as z from 'zod';

export const TAG = '#EXT-X-RENDITION-REPORT' as const;

/**
 * The EXT-X-RENDITION-REPORT tag provides rendition information reporting
 * in Media Playlists for low-latency streaming.
 *
 * Its format is:
 *
 * #EXT-X-RENDITION-REPORT:<attribute-list>
 *
 * The following attributes are defined:
 *
 * URI: The URI of the Media Playlist for the rendition. REQUIRED.
 * LAST-MSN: The Media Sequence Number of the last Media Segment currently
 *   in the rendition's Media Playlist.
 * LAST-PART: The Part Index of the last Partial Segment currently in the
 *   rendition's Media Playlist.
 *
 * This tag appears in Media Playlists and provides information about other
 * renditions of the same content, enabling better synchronization in
 * low-latency scenarios.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.5.4
 */
export const EXT_X_RENDITION_REPORT_STRING = z.string().startsWith(TAG);

export const EXT_X_RENDITION_REPORT_OBJECT = z
    .object({
        URI: z.string(),
        'LAST-MSN': z.coerce.number().int().optional(),
        'LAST-PART': z.coerce.number().int().optional(),
    })
    .describe(`
    The EXT-X-RENDITION-REPORT tag provides rendition information reporting
    in Media Playlists for low-latency streaming.

    Its format is:

    #EXT-X-RENDITION-REPORT:<attribute-list>

    The following attributes are defined:

    URI: The URI of the Media Playlist for the rendition. REQUIRED.
    LAST-MSN: The Media Sequence Number of the last Media Segment currently
      in the rendition's Media Playlist.
    LAST-PART: The Part Index of the last Partial Segment currently in the
      rendition's Media Playlist.

    This tag appears in Media Playlists and provides information about other
    renditions of the same content, enabling better synchronization in
    low-latency scenarios.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.5.4
`);

export const EXT_X_RENDITION_REPORT_CODEC = z.codec(
    EXT_X_RENDITION_REPORT_STRING,
    EXT_X_RENDITION_REPORT_OBJECT,
    {
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
                    if (trimmedKey === 'LAST-MSN' || trimmedKey === 'LAST-PART') {
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
            if (obj.URI) attrs.push(`URI="${obj.URI}"`);
            if (obj['LAST-MSN'] !== undefined) attrs.push(`LAST-MSN=${obj['LAST-MSN']}`);
            if (obj['LAST-PART'] !== undefined) attrs.push(`LAST-PART=${obj['LAST-PART']}`);
            return `${TAG}:${attrs.join(',')}` as any;
        },
    },
);

export type EXT_X_RENDITION_REPORT_STRING_TYPE = `#EXT-X-RENDITION-REPORT:${string}`;
