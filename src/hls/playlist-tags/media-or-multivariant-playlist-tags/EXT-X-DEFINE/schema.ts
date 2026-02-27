import * as z from 'zod';

export const TAG = '#EXT-X-DEFINE' as const;

/**
 * The EXT-X-DEFINE tag enables Playlist variable definition or declaration.
 *
 * Its format is:
 *
 * #EXT-X-DEFINE:<attribute-list>
 *
 * The following attributes are defined:
 *
 * NAME: The variable name. REQUIRED for all variants.
 * VALUE: The variable value. REQUIRED if IMPORT is not present.
 * IMPORT: Indicates the variable value should be imported from the client.
 * QUERYPARAM: Indicates the variable value should be taken from a URI query parameter.
 *
 * Variables can be substituted in the playlist using {$NAME} syntax.
 *
 * The EXT-X-DEFINE tag can appear in both Media Playlists and Multivariant
 * Playlists. Variable substitution allows for dynamic content customization.
 *
 * Defined in: draft-pantos-hls-rfc8216bis Section 4.4.2.3
 */
export const EXT_X_DEFINE_STRING = z.string().startsWith(TAG);

export const EXT_X_DEFINE_OBJECT = z
    .object({
        NAME: z.string(),
        VALUE: z.string().optional(),
        IMPORT: z.string().optional(),
        QUERYPARAM: z.string().optional(),
    })
    .describe(`
    The EXT-X-DEFINE tag enables Playlist variable definition or declaration.

    Its format is:

    #EXT-X-DEFINE:<attribute-list>

    The following attributes are defined:

    NAME: The variable name. REQUIRED for all variants.
    VALUE: The variable value. REQUIRED if IMPORT is not present.
    IMPORT: Indicates the variable value should be imported from the client.
    QUERYPARAM: Indicates the variable value should be taken from a URI query parameter.

    Variables can be substituted in the playlist using {$NAME} syntax.

    The EXT-X-DEFINE tag can appear in both Media Playlists and Multivariant
    Playlists. Variable substitution allows for dynamic content customization.

    Defined in: draft-pantos-hls-rfc8216bis Section 4.4.2.3
`);

export const EXT_X_DEFINE_CODEC = z.codec(EXT_X_DEFINE_STRING, EXT_X_DEFINE_OBJECT, {
    decode: (value) => {
        // TODO: Implement proper attribute list parsing
        // This is a placeholder implementation
        const attributeListString = value.substring(TAG.length + 1);
        const result: any = {};

        // Basic parsing - should use fromAttributeList helper
        const parts = attributeListString.split(',');
        parts.forEach((part) => {
            const [key, val] = part.split('=');
            if (key && val) {
                result[key.trim()] = val.replace(/^"|"$/g, '').trim();
            }
        });

        return result;
    },
    encode: (obj) => {
        // TODO: Implement proper attribute list encoding
        const attrs: string[] = [];
        if (obj.NAME) attrs.push(`NAME="${obj.NAME}"`);
        if (obj.VALUE) attrs.push(`VALUE="${obj.VALUE}"`);
        if (obj.IMPORT) attrs.push(`IMPORT="${obj.IMPORT}"`);
        if (obj.QUERYPARAM) attrs.push(`QUERYPARAM="${obj.QUERYPARAM}"`);
        return `${TAG}:${attrs.join(',')}` as any;
    },
});

export type EXT_X_DEFINE_STRING_TYPE = `#EXT-X-DEFINE:${string}`;
