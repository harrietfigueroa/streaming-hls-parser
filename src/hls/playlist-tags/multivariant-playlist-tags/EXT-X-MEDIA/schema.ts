import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-MEDIA' as const;
export const EXT_X_MEDIA_STRING = z.templateLiteral([TAG, ':', z.string()]);

// Helper schemas for specific attribute types
const TYPE_ENUM = z.enum(['AUDIO', 'VIDEO', 'SUBTITLES', 'CLOSED-CAPTIONS']);
const YES_NO_ENUM = z.enum(['YES', 'NO']);
const INSTREAM_ID_ENUM = z
    .enum(['CC1', 'CC2', 'CC3', 'CC4'])
    .or(z.string().regex(/^SERVICE\d+/, 'Must be SERVICE followed by a number between 1-63'));

export const EXT_X_MEDIA_OBJECT = z
    .object({
        /**
         * TYPE
         * The value is an enumerated-string; valid strings are AUDIO, VIDEO,
         * SUBTITLES, and CLOSED-CAPTIONS. This attribute is REQUIRED.
         */
        TYPE: TYPE_ENUM,

        /**
         * URI
         * The value is a quoted-string containing a URI that identifies the
         * Media Playlist file. This attribute is OPTIONAL; see
         * Section 4.3.4.2.1. If the TYPE is CLOSED-CAPTIONS, the URI
         * attribute MUST NOT be present.
         */
        URI: z.string().optional(),

        /**
         * GROUP-ID
         * The value is a quoted-string that specifies the group to which the
         * Rendition belongs. See Section 4.3.4.1.1. This attribute is
         * REQUIRED.
         */
        'GROUP-ID': z.string(),

        /**
         * LANGUAGE
         * The value is a quoted-string containing one of the standard Tags
         * for Identifying Languages [RFC5646], which identifies the primary
         * language used in the Rendition. This attribute is OPTIONAL.
         */
        LANGUAGE: z.string().optional(),

        /**
         * ASSOC-LANGUAGE
         * The value is a quoted-string containing a language tag [RFC5646]
         * that identifies a language that is associated with the Rendition.
         * An associated language is often used in a different role than the
         * language specified by the LANGUAGE attribute (e.g., written versus
         * spoken or a fallback dialect). This attribute is OPTIONAL.
         */
        'ASSOC-LANGUAGE': z.string().optional(),

        /**
         * NAME
         * The value is a quoted-string containing a human-readable
         * description of the Rendition. If the LANGUAGE attribute is
         * present, then this description SHOULD be in that language. This
         * attribute is REQUIRED.
         */
        NAME: z.string(),

        /**
         * DEFAULT
         * The value is an enumerated-string; valid strings are YES and NO.
         * If the value is YES, then the client SHOULD play this Rendition of
         * the content in the absence of information from the user indicating
         * a different choice. This attribute is OPTIONAL. Its absence
         * indicates an implicit value of NO.
         */
        DEFAULT: YES_NO_ENUM.optional(),

        /**
         * AUTOSELECT
         * The value is an enumerated-string; valid strings are YES and NO.
         * This attribute is OPTIONAL. Its absence indicates an implicit
         * value of NO. If the value is YES, then the client MAY choose to
         * play this Rendition in the absence of explicit user preference
         * because it matches the current playback environment, such as
         * chosen system language.
         */
        AUTOSELECT: YES_NO_ENUM.optional(),

        /**
         * FORCED
         * The value is an enumerated-string; valid strings are YES and NO.
         * This attribute is OPTIONAL. Its absence indicates an implicit
         * value of NO. The FORCED attribute MUST NOT be present unless the
         * TYPE is SUBTITLES.
         */
        FORCED: YES_NO_ENUM.optional(),

        /**
         * INSTREAM-ID
         * The value is a quoted-string that specifies a Rendition within the
         * segments in the Media Playlist. This attribute is REQUIRED if the
         * TYPE attribute is CLOSED-CAPTIONS, in which case it MUST have one
         * of the values: "CC1", "CC2", "CC3", "CC4", or "SERVICEn" where n
         * MUST be an integer between 1 and 63 (e.g., "SERVICE3" or
         * "SERVICE42").
         */
        'INSTREAM-ID': INSTREAM_ID_ENUM.optional(),

        /**
         * CHARACTERISTICS
         * The value is a quoted-string containing one or more Uniform Type
         * Identifiers [UTI] separated by comma (,) characters. This
         * attribute is OPTIONAL. Each UTI indicates an individual
         * characteristic of the Rendition.
         */
        CHARACTERISTICS: z.string().optional(),

        /**
         * CHANNELS
         * The value is a quoted-string that specifies an ordered, backslash-
         * separated ("/") list of parameters. If the TYPE attribute is
         * AUDIO, then the first parameter is a count of audio channels
         * expressed as a decimal-integer, indicating the maximum number of
         * independent, simultaneous audio channels present in any Media
         * Segment in the Rendition.
         */
        CHANNELS: z.string().optional(),
    })
    .refine(
        (data) => {
            // If TYPE is CLOSED-CAPTIONS, URI must not be present
            if (data.TYPE === 'CLOSED-CAPTIONS' && data.URI) {
                return false;
            }
            return true;
        },
        {
            message: 'URI attribute MUST NOT be present when TYPE is CLOSED-CAPTIONS',
            path: ['URI'],
        },
    )
    .refine(
        (data) => {
            // If TYPE is CLOSED-CAPTIONS, INSTREAM-ID is REQUIRED
            if (data.TYPE === 'CLOSED-CAPTIONS' && !data['INSTREAM-ID']) {
                return false;
            }
            return true;
        },
        {
            message: 'INSTREAM-ID attribute is REQUIRED when TYPE is CLOSED-CAPTIONS',
            path: ['INSTREAM-ID'],
        },
    )
    .refine(
        (data) => {
            // FORCED attribute MUST NOT be present unless TYPE is SUBTITLES
            if (data.FORCED && data.TYPE !== 'SUBTITLES') {
                return false;
            }
            return true;
        },
        {
            message: 'FORCED attribute MUST NOT be present unless TYPE is SUBTITLES',
            path: ['FORCED'],
        },
    )
    .refine(
        (data) => {
            // If AUTOSELECT is present, its value MUST be YES if DEFAULT is YES
            if (data.DEFAULT === 'YES' && data.AUTOSELECT && data.AUTOSELECT !== 'YES') {
                return false;
            }
            return true;
        },
        {
            message: 'AUTOSELECT value MUST be YES if DEFAULT value is YES',
            path: ['AUTOSELECT'],
        },
    );

/**
 * The EXT-X-MEDIA tag is used to relate Media Playlists that contain
 * alternative Renditions (Section 4.3.4.2.1) of the same content. For
 * example, three EXT-X-MEDIA tags can be used to identify audio-only
 * Media Playlists that contain English, French, and Spanish Renditions
 * of the same presentation. Or, two EXT-X-MEDIA tags can be used to
 * identify video-only Media Playlists that show two different camera
 * angles.
 *
 * Its format is:
 *
 * #EXT-X-MEDIA:<attribute-list>
 */
export const EXT_X_MEDIA_CODEC = z.codec(EXT_X_MEDIA_STRING, EXT_X_MEDIA_OBJECT, {
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
        if (obj['GROUP-ID']) {
            preEncoded['GROUP-ID'] = `"${obj['GROUP-ID']}"`;
        }
        if (obj.LANGUAGE) {
            preEncoded.LANGUAGE = `"${obj.LANGUAGE}"`;
        }
        if (obj['ASSOC-LANGUAGE']) {
            preEncoded['ASSOC-LANGUAGE'] = `"${obj['ASSOC-LANGUAGE']}"`;
        }
        if (obj.NAME) {
            preEncoded.NAME = `"${obj.NAME}"`;
        }
        if (obj['INSTREAM-ID']) {
            preEncoded['INSTREAM-ID'] = `"${obj['INSTREAM-ID']}"`;
        }
        if (obj.CHARACTERISTICS) {
            preEncoded.CHARACTERISTICS = `"${obj.CHARACTERISTICS}"`;
        }
        if (obj.CHANNELS) {
            preEncoded.CHANNELS = `"${obj.CHANNELS}"`;
        }

        return `${TAG}:${toAttributeList(preEncoded)}` as any;
    },
});
