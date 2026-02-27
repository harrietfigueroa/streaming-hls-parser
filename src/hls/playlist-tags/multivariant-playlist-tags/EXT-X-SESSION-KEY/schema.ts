import * as z from 'zod';
import { fromAttributeList } from '../../../parse-helpers/attribute-list';
import { stripTag } from '../../../parse-helpers/strip-tag';
import { EXT_X_KEY_OBJECT } from '../../media-segment-tags/EXT-X-KEY/schema';

export const TAG = '#EXT-X-SESSION-KEY' as const;
export const EXT_X_SESSION_KEY_STRING = z.templateLiteral([TAG, ':', z.string()]);

/**
 * The EXT-X-SESSION-KEY tag allows encryption keys from Media Playlists
 * to be specified in a Master Playlist. This allows the client to
 * preload these keys without having to read the Media Playlist(s)
 * first.
 *
 * Its format is:
 *
 * #EXT-X-SESSION-KEY:<attribute-list>
 *
 * All attributes defined for the EXT-X-KEY tag (Section 4.3.2.4) are
 * also defined for the EXT-X-SESSION-KEY, except that the value of the
 * METHOD attribute MUST NOT be NONE. If an EXT-X-SESSION-KEY is used,
 * the values of the METHOD, KEYFORMAT, and KEYFORMATVERSIONS attributes
 * MUST match any EXT-X-KEY with the same URI value.
 *
 * EXT-X-SESSION-KEY tags SHOULD be added if multiple Variant Streams or
 * Renditions use the same encryption keys and formats. An EXT-X-
 * SESSION-KEY tag is not associated with any particular Media Playlist.
 *
 * A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY
 * tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS
 * attribute values.
 *
 * The EXT-X-SESSION-KEY tag is optional.
 */
export const EXT_X_SESSION_KEY_OBJECT = EXT_X_KEY_OBJECT.refine(
    (data) => {
        // METHOD MUST NOT be NONE for EXT-X-SESSION-KEY
        return data.METHOD !== 'NONE';
    },
    {
        message: 'METHOD attribute MUST NOT be NONE according to RFC 8216 Section 4.3.4.2.3',
        path: ['METHOD'],
    },
).readonly();

export const EXT_X_SESSION_KEY_CODEC = z.codec(EXT_X_SESSION_KEY_STRING, EXT_X_SESSION_KEY_OBJECT, {
    decode: (value) => {
        const obj: any = fromAttributeList(stripTag(value));
        return obj;
    },
    encode: (obj) => {
        const parts: string[] = [];

        // METHOD: enumerated-string - encryption method (not quoted)
        // Note: MUST NOT be NONE for SESSION-KEY
        if (obj.METHOD !== undefined) {
            parts.push(`METHOD=${obj.METHOD}`);
        }

        // URI: quoted-string - URI of the key file (always quoted)
        if (obj.URI !== undefined) {
            parts.push(`URI="${obj.URI}"`);
        }

        // IV: hexadecimal-sequence - 128-bit initialization vector (not quoted)
        if (obj.IV !== undefined) {
            parts.push(`IV=${obj.IV}`);
        }

        // KEYFORMAT: quoted-string - format of the key (always quoted)
        if (obj.KEYFORMAT !== undefined) {
            parts.push(`KEYFORMAT="${obj.KEYFORMAT}"`);
        }

        // KEYFORMATVERSIONS: quoted-string - versions of KEYFORMAT (always quoted)
        if (obj.KEYFORMATVERSIONS !== undefined) {
            parts.push(`KEYFORMATVERSIONS="${obj.KEYFORMATVERSIONS}"`);
        }

        return `${TAG}:${parts.join(',')}` as any;
    },
});

export type EXT_X_SESSION_KEY_STRING_TYPE = `#EXT-X-SESSION-KEY:${string}`;
