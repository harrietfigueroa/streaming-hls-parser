import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
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
);

export const EXT_X_SESSION_KEY_CODEC = z.codec(EXT_X_SESSION_KEY_STRING, EXT_X_SESSION_KEY_OBJECT, {
    decode: (value) => {
        const obj: any = fromAttributeList(stripTag(value));
        return obj;
    },
    encode: (obj) => {
        const preEncoded: Record<string, unknown> = {
            ...obj,
        };

        // Quote string values that need to be quoted
        if (obj.URI) {
            preEncoded.URI = `"${obj.URI}"`;
        }
        if (obj.KEYFORMAT) {
            preEncoded.KEYFORMAT = `"${obj.KEYFORMAT}"`;
        }
        if (obj.KEYFORMATVERSIONS) {
            preEncoded.KEYFORMATVERSIONS = `"${obj.KEYFORMATVERSIONS}"`;
        }

        return `${TAG}:${toAttributeList(preEncoded)}` as any;
    },
});

export type EXT_X_SESSION_KEY_STRING_TYPE = `#EXT-X-SESSION-KEY:${string}`;
