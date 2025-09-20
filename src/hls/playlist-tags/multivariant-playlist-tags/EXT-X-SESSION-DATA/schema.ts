import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-SESSION-DATA' as const;
export const EXT_X_SESSION_DATA_STRING = z.templateLiteral([TAG, ':', z.string()]);

/**
 * The EXT-X-SESSION-DATA tag allows arbitrary session data to be
 * carried in a Master Playlist.
 *
 * Its format is:
 *
 * #EXT-X-SESSION-DATA:<attribute-list>
 */
export const EXT_X_SESSION_DATA_OBJECT = z
    .object({
        /**
         * DATA-ID
         * The value of DATA-ID is a quoted-string that identifies a
         * particular data value. The DATA-ID SHOULD conform to a reverse
         * DNS naming convention, such as "com.example.movie.title"; however,
         * there is no central registration authority, so Playlist authors
         * SHOULD take care to choose a value that is unlikely to collide
         * with others. This attribute is REQUIRED.
         */
        'DATA-ID': z.string().min(1, 'DATA-ID must not be empty'),

        /**
         * VALUE
         * VALUE is a quoted-string. It contains the data identified by
         * DATA-ID. If the LANGUAGE is specified, VALUE SHOULD contain a
         * human-readable string written in the specified language.
         */
        VALUE: z.string().min(1, 'VALUE must not be empty').optional(),

        /**
         * URI
         * The value is a quoted-string containing a URI. The resource
         * identified by the URI MUST be formatted as JSON [RFC7159];
         * otherwise, clients may fail to interpret the resource.
         */
        URI: z.url('URI must be a valid URL').optional(),

        /**
         * LANGUAGE
         * The value is a quoted-string containing a language tag [RFC5646]
         * that identifies the language of the VALUE. This attribute is
         * OPTIONAL.
         */
        LANGUAGE: z
            .string()
            .regex(
                /^[a-z]{2}(-[A-Z]{2})?(-[a-z0-9]{5,8})?(-[a-z0-9]{1,8})*$/i,
                'LANGUAGE must be a valid RFC5646 language tag (e.g., "en", "en-US", "zh-Hans-CN")',
            )
            .optional(),
    })
    .refine(
        (data) => {
            // Must contain either VALUE or URI, but not both
            const hasValue = !!data.VALUE;
            const hasUri = !!data.URI;
            return (hasValue && !hasUri) || (!hasValue && hasUri);
        },
        {
            message:
                'EXT-X-SESSION-DATA tag must contain either a VALUE or URI attribute, but not both according to RFC 8216 Section 4.3.4.2.2',
            path: ['VALUE', 'URI'],
        },
    )
    .refine(
        (data) => {
            // If LANGUAGE is specified, VALUE should be present (not URI)
            if (data.LANGUAGE && !data.VALUE) {
                return false;
            }
            return true;
        },
        {
            message: 'LANGUAGE attribute can only be used with VALUE attribute, not with URI',
            path: ['LANGUAGE'],
        },
    );

export const EXT_X_SESSION_DATA_CODEC = z.codec(
    EXT_X_SESSION_DATA_STRING,
    EXT_X_SESSION_DATA_OBJECT,
    {
        decode: (value) => {
            const obj: any = fromAttributeList(stripTag(value));
            return obj;
        },
        encode: (obj) => {
            const preEncoded: Record<string, unknown> = {
                ...obj,
            };

            // Quote string values that need to be quoted
            if (obj['DATA-ID']) {
                preEncoded['DATA-ID'] = `"${obj['DATA-ID']}"`;
            }
            if (obj.VALUE) {
                preEncoded.VALUE = `"${obj.VALUE}"`;
            }
            if (obj.URI) {
                preEncoded.URI = `"${obj.URI}"`;
            }
            if (obj.LANGUAGE) {
                preEncoded.LANGUAGE = `"${obj.LANGUAGE}"`;
            }

            return `${TAG}:${toAttributeList(preEncoded)}` as any;
        },
    },
);

export type EXT_X_SESSION_DATA_STRING_TYPE = `#EXT-X-SESSION-DATA:${string}`;
