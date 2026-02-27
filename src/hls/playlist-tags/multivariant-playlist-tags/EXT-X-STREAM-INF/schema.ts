import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-STREAM-INF' as const;
export const EXT_X_STREAM_INF_STRING = z.templateLiteral([TAG, ':', z.string()]);

// Helper schemas for specific attribute types
const HDCP_LEVEL_ENUM = z.enum(['TYPE-0', 'NONE']);

/**
 * The EXT-X-STREAM-INF tag specifies a Variant Stream, which is a set
 * of Renditions that can be combined to play the presentation. The
 * attributes of the tag provide information about the Variant Stream.
 *
 * The URI line that follows the EXT-X-STREAM-INF tag specifies a Media
 * Playlist that carries a Rendition of the Variant Stream. The URI
 * line is REQUIRED. Clients that do not support multiple video
 * Renditions SHOULD play this Rendition.
 *
 * Its format is:
 *
 * #EXT-X-STREAM-INF:<attribute-list>
 * <URI>
 */
export const EXT_X_STREAM_INF_OBJECT = z
    .object({
        /**
         * BANDWIDTH
         * The value is a decimal-integer of bits per second. It represents
         * the peak segment bit rate of the Variant Stream.
         *
         * If all the Media Segments in a Variant Stream have already been
         * created, the BANDWIDTH value MUST be the largest sum of peak
         * segment bit rates that is produced by any playable combination of
         * Renditions. (For a Variant Stream with a single Media Playlist,
         * this is just the peak segment bit rate of that Media Playlist.)
         * An inaccurate value can cause playback stalls or prevent clients
         * from playing the variant.
         *
         * If the Master Playlist is to be made available before all Media
         * Segments in the presentation have been encoded, the BANDWIDTH
         * value SHOULD be the BANDWIDTH value of a representative period of
         * similar content, encoded using the same settings.
         *
         * Every EXT-X-STREAM-INF tag MUST include the BANDWIDTH attribute.
         */
        BANDWIDTH: z.number().int().min(0, 'BANDWIDTH must be a non-negative integer'),

        /**
         * AVERAGE-BANDWIDTH
         * The value is a decimal-integer of bits per second. It represents
         * the average segment bit rate of the Variant Stream.
         *
         * If all the Media Segments in a Variant Stream have already been
         * created, the AVERAGE-BANDWIDTH value MUST be the largest sum of
         * average segment bit rates that is produced by any playable
         * combination of Renditions. (For a Variant Stream with a single
         * Media Playlist, this is just the average segment bit rate of that
         * Media Playlist.) An inaccurate value can cause playback stalls or
         * prevent clients from playing the variant.
         *
         * If the Master Playlist is to be made available before all Media
         * Segments in the presentation have been encoded, the AVERAGE-
         * BANDWIDTH value SHOULD be the AVERAGE-BANDWIDTH value of a
         * representative period of similar content, encoded using the same
         * settings.
         *
         * The AVERAGE-BANDWIDTH attribute is OPTIONAL.
         */
        'AVERAGE-BANDWIDTH': z
            .number()
            .int()
            .min(0, 'AVERAGE-BANDWIDTH must be a non-negative integer')
            .optional(),

        /**
         * CODECS
         * The value is a quoted-string containing a comma-separated list of
         * formats, where each format specifies a media sample type that is
         * present in one or more Renditions specified by the Variant Stream.
         * Valid format identifiers are those in the ISO Base Media File
         * Format Name Space defined by "The 'Codecs' and 'Profiles'
         * Parameters for "Bucket" Media Types" [RFC6381].
         *
         * For example, a stream containing AAC low complexity (AAC-LC) audio
         * and H.264 Main Profile Level 3.0 video would have a CODECS value
         * of "mp4a.40.2,avc1.4d401e".
         *
         * Every EXT-X-STREAM-INF tag SHOULD include a CODECS attribute.
         */
        CODECS: z.array(z.string()).optional(),

        /**
         * RESOLUTION
         * The value is a decimal-resolution describing the optimal pixel
         * resolution at which to display all the video in the Variant
         * Stream.
         *
         * The RESOLUTION attribute is OPTIONAL but is recommended if the
         * Variant Stream includes video.
         */
        RESOLUTION: z
            .object({
                width: z.number().int().min(1, 'Width must be a positive integer'),
                height: z.number().int().min(1, 'Height must be a positive integer'),
            })
            .readonly()
            .optional(),

        /**
         * FRAME-RATE
         * The value is a decimal-floating-point describing the maximum frame
         * rate for all the video in the Variant Stream, rounded to three
         * decimal places.
         *
         * The FRAME-RATE attribute is OPTIONAL but is recommended if the
         * Variant Stream includes video. The FRAME-RATE attribute SHOULD be
         * included if any video in a Variant Stream exceeds 30 frames per
         * second.
         */
        'FRAME-RATE': z.number().min(0, 'FRAME-RATE must be non-negative').optional(),

        /**
         * HDCP-LEVEL
         * The value is an enumerated-string; valid strings are TYPE-0 and
         * NONE. This attribute is advisory; a value of TYPE-0 indicates
         * that the Variant Stream could fail to play unless the output is
         * protected by High-bandwidth Digital Content Protection (HDCP) Type
         * 0 [HDCP] or equivalent. A value of NONE indicates that the
         * content does not require output copy protection.
         *
         * Encrypted Variant Streams with different HDCP levels SHOULD use
         * different media encryption keys.
         */
        'HDCP-LEVEL': HDCP_LEVEL_ENUM.optional(),

        /**
         * AUDIO
         * The value is a quoted-string. It MUST match the value of the
         * GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
         * Playlist whose TYPE attribute is AUDIO. It indicates the set of
         * audio Renditions that SHOULD be used when playing the
         * presentation. See Section 4.3.4.2.1.
         *
         * The AUDIO attribute is OPTIONAL.
         */
        AUDIO: z.string().optional(),

        /**
         * VIDEO
         * The value is a quoted-string. It MUST match the value of the
         * GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
         * Playlist whose TYPE attribute is VIDEO. It indicates the set of
         * video Renditions that SHOULD be used when playing the
         * presentation. See Section 4.3.4.2.1.
         *
         * The VIDEO attribute is OPTIONAL.
         */
        VIDEO: z.string().optional(),

        /**
         * SUBTITLES
         * The value is a quoted-string. It MUST match the value of the
         * GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
         * Playlist whose TYPE attribute is SUBTITLES. It indicates the set of
         * subtitle Renditions that can be used when playing the presentation.
         *
         * The SUBTITLES attribute is OPTIONAL.
         */
        SUBTITLES: z.string().optional(),

        /**
         * CLOSED-CAPTIONS
         * The value can either be a quoted-string or an enumerated-string with
         * the value NONE. If the value is a quoted-string, it MUST match the
         * value of the GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in
         * the Playlist whose TYPE attribute is CLOSED-CAPTIONS. If the value
         * is NONE, all EXT-X-STREAM-INF tags MUST have this attribute with a
         * value of NONE, indicating that there are no closed captions in any
         * Variant Stream in the Master Playlist.
         *
         * The CLOSED-CAPTIONS attribute is OPTIONAL.
         */
        'CLOSED-CAPTIONS': z.union([z.string(), z.literal('NONE')]).optional(),
    })
    .refine(
        (data) => {
            // AVERAGE-BANDWIDTH should not exceed BANDWIDTH
            if (data['AVERAGE-BANDWIDTH'] && data['AVERAGE-BANDWIDTH'] > data.BANDWIDTH) {
                return false;
            }
            return true;
        },
        {
            message: 'AVERAGE-BANDWIDTH must not exceed BANDWIDTH',
            path: ['AVERAGE-BANDWIDTH'],
        },
    )
    .readonly();

export const EXT_X_STREAM_INF_CODEC = z.codec(EXT_X_STREAM_INF_STRING, EXT_X_STREAM_INF_OBJECT, {
    decode: (value) => {
        // Parse attribute list from the tag
        const attributeListString = stripTag(value);
        const result: Record<string, string> = {};
        let currentKey = '';
        let currentValue = '';
        let inQuotes = false;
        let i = 0;
        let parsingValue = false;

        while (i < attributeListString.length) {
            const char = attributeListString[i];

            if (char === '"' && (i === 0 || attributeListString[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
                if (parsingValue) {
                    currentValue += char;
                }
            } else if (char === '=' && !inQuotes && !parsingValue) {
                parsingValue = true;
            } else if (char === ',' && !inQuotes) {
                if (currentKey && currentValue !== undefined) {
                    const cleanValue =
                        currentValue.startsWith('"') && currentValue.endsWith('"')
                            ? currentValue.slice(1, -1)
                            : currentValue;
                    result[currentKey] = cleanValue;
                }
                currentKey = '';
                currentValue = '';
                parsingValue = false;
            } else if (parsingValue) {
                currentValue += char;
            } else {
                currentKey += char;
            }
            i++;
        }

        if (currentKey && currentValue !== undefined) {
            const cleanValue =
                currentValue.startsWith('"') && currentValue.endsWith('"')
                    ? currentValue.slice(1, -1)
                    : currentValue;
            result[currentKey] = cleanValue;
        }

        const obj: any = result;

        // Convert string values to appropriate types
        if (obj.BANDWIDTH) {
            obj.BANDWIDTH = parseFloat(obj.BANDWIDTH);
        }
        if (obj['AVERAGE-BANDWIDTH']) {
            obj['AVERAGE-BANDWIDTH'] = parseFloat(obj['AVERAGE-BANDWIDTH']);
        }
        if (obj.CODECS) {
            obj.CODECS = obj.CODECS.split(',');
        }
        if (obj.RESOLUTION) {
            // Parse resolution format like "1920x1080"
            const [width, height] = obj.RESOLUTION.split('x');
            obj.RESOLUTION = {
                width: parseInt(width, 10),
                height: parseInt(height, 10),
            };
        }
        if (obj['FRAME-RATE']) {
            obj['FRAME-RATE'] = parseFloat(obj['FRAME-RATE']);
        }

        return obj;
    },
    encode: (obj) => {
        const parts: string[] = [];

        // BANDWIDTH: decimal-integer - peak segment bit rate in bits per second (not quoted)
        if (obj.BANDWIDTH !== undefined) {
            parts.push(`BANDWIDTH=${obj.BANDWIDTH}`);
        }

        // AVERAGE-BANDWIDTH: decimal-integer - average segment bit rate (not quoted)
        if (obj['AVERAGE-BANDWIDTH'] !== undefined) {
            parts.push(`AVERAGE-BANDWIDTH=${obj['AVERAGE-BANDWIDTH']}`);
        }

        // CODECS: quoted-string - comma-separated list of formats (always quoted)
        if (obj.CODECS !== undefined) {
            parts.push(`CODECS="${obj.CODECS.join(',')}"`);
        }

        // RESOLUTION: decimal-resolution - optimal pixel resolution (not quoted)
        if (obj.RESOLUTION !== undefined) {
            parts.push(`RESOLUTION=${obj.RESOLUTION.width}x${obj.RESOLUTION.height}`);
        }

        // FRAME-RATE: decimal-floating-point - maximum frame rate (not quoted)
        if (obj['FRAME-RATE'] !== undefined) {
            parts.push(`FRAME-RATE=${obj['FRAME-RATE']}`);
        }

        // HDCP-LEVEL: enumerated-string - HDCP level (not quoted)
        if (obj['HDCP-LEVEL'] !== undefined) {
            parts.push(`HDCP-LEVEL=${obj['HDCP-LEVEL']}`);
        }

        // AUDIO: quoted-string - audio rendition group ID (always quoted)
        if (obj.AUDIO !== undefined) {
            parts.push(`AUDIO="${obj.AUDIO}"`);
        }

        // VIDEO: quoted-string - video rendition group ID (always quoted)
        if (obj.VIDEO !== undefined) {
            parts.push(`VIDEO="${obj.VIDEO}"`);
        }

        // SUBTITLES: quoted-string - subtitle rendition group ID (always quoted)
        if (obj.SUBTITLES !== undefined) {
            parts.push(`SUBTITLES="${obj.SUBTITLES}"`);
        }

        // CLOSED-CAPTIONS: quoted-string or NONE - closed captions group ID (always quoted or NONE)
        if (obj['CLOSED-CAPTIONS'] !== undefined) {
            if (obj['CLOSED-CAPTIONS'] === 'NONE') {
                parts.push(`CLOSED-CAPTIONS=NONE`);
            } else {
                parts.push(`CLOSED-CAPTIONS="${obj['CLOSED-CAPTIONS']}"`);
            }
        }

        return `${TAG}:${parts.join(',')}` as any;
    },
});

export type EXT_X_STREAM_INF_STRING_TYPE = `#EXT-X-STREAM-INF:${string}`;
