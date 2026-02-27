import * as z from 'zod';

export const TAG = '#EXT-X-SERVER-CONTROL' as const;

/**
 * The EXT-X-SERVER-CONTROL tag signals server capabilities including
 * Playlist Delta Updates, hold-back parameters, and blocking reload support.
 *
 * Its format is:
 *
 * #EXT-X-SERVER-CONTROL:<attribute-list>
 *
 * The following attributes are defined:
 *
 * CAN-SKIP-UNTIL: A decimal-floating-point number of seconds indicating how
 *   far back the client can skip in Playlist Delta Updates.
 * CAN-SKIP-DATERANGES: An enumerated-string value (YES or NO) indicating
 *   whether the server supports skipping EXT-X-DATERANGE tags.
 * HOLD-BACK: A decimal-floating-point number of seconds indicating the
 *   minimum time from the last media segment that a client should wait before
 *   attempting to reload the Playlist.
 * PART-HOLD-BACK: A decimal-floating-point number indicating the minimum
 *   hold-back time for partial segments.
 * CAN-BLOCK-RELOAD: An enumerated-string value (YES or NO) indicating
 *   whether the server supports blocking playlist reload.
 *
 * This tag applies only to Media Playlists.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.3.8
 */
export const EXT_X_SERVER_CONTROL_STRING = z.string().startsWith(TAG);

export const EXT_X_SERVER_CONTROL_OBJECT = z
    .object({
        'CAN-SKIP-UNTIL': z.coerce.number().optional(),
        'CAN-SKIP-DATERANGES': z.enum(['YES', 'NO']).optional(),
        'HOLD-BACK': z.coerce.number().optional(),
        'PART-HOLD-BACK': z.coerce.number().optional(),
        'CAN-BLOCK-RELOAD': z.enum(['YES', 'NO']).optional(),
    })
    .describe(`
    The EXT-X-SERVER-CONTROL tag signals server capabilities including
    Playlist Delta Updates, hold-back parameters, and blocking reload support.

    Its format is:

    #EXT-X-SERVER-CONTROL:<attribute-list>

    The following attributes are defined:

    CAN-SKIP-UNTIL: A decimal-floating-point number of seconds indicating how
      far back the client can skip in Playlist Delta Updates.
    CAN-SKIP-DATERANGES: An enumerated-string value (YES or NO) indicating
      whether the server supports skipping EXT-X-DATERANGE tags.
    HOLD-BACK: A decimal-floating-point number of seconds indicating the
      minimum time from the last media segment that a client should wait before
      attempting to reload the Playlist.
    PART-HOLD-BACK: A decimal-floating-point number indicating the minimum
      hold-back time for partial segments.
    CAN-BLOCK-RELOAD: An enumerated-string value (YES or NO) indicating
      whether the server supports blocking playlist reload.

    This tag applies only to Media Playlists.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.3.8
`);

export const EXT_X_SERVER_CONTROL_CODEC = z.codec(
    EXT_X_SERVER_CONTROL_STRING,
    EXT_X_SERVER_CONTROL_OBJECT,
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
                    if (trimmedKey === 'CAN-SKIP-UNTIL' || trimmedKey === 'HOLD-BACK' || trimmedKey === 'PART-HOLD-BACK') {
                        result[trimmedKey] = parseFloat(trimmedVal);
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
            if (obj['CAN-SKIP-UNTIL'] !== undefined) attrs.push(`CAN-SKIP-UNTIL=${obj['CAN-SKIP-UNTIL']}`);
            if (obj['CAN-SKIP-DATERANGES']) attrs.push(`CAN-SKIP-DATERANGES=${obj['CAN-SKIP-DATERANGES']}`);
            if (obj['HOLD-BACK'] !== undefined) attrs.push(`HOLD-BACK=${obj['HOLD-BACK']}`);
            if (obj['PART-HOLD-BACK'] !== undefined) attrs.push(`PART-HOLD-BACK=${obj['PART-HOLD-BACK']}`);
            if (obj['CAN-BLOCK-RELOAD']) attrs.push(`CAN-BLOCK-RELOAD=${obj['CAN-BLOCK-RELOAD']}`);
            return `${TAG}:${attrs.join(',')}` as any;
        },
    },
);

export type EXT_X_SERVER_CONTROL_STRING_TYPE = `#EXT-X-SERVER-CONTROL:${string}`;
