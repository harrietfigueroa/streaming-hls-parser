import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-I-FRAME-STREAM-INF' as const;
export const EXT_X_I_FRAME_STREAM_INF_STRING = z.templateLiteral([
    TAG,
    ':',
    z.string(),
    '\n',
    z.string(),
]);

/**
 * The EXT-X-I-FRAME-STREAM-INF tag identifies a Media Playlist file
   containing the I-frames of a multimedia presentation.  It stands
   alone, in that it does not apply to a particular URI in the Master
   Playlist.  Its format is:

   #EXT-X-I-FRAME-STREAM-INF:<attribute-list>

   All attributes defined for the EXT-X-STREAM-INF tag (Section 4.3.4.2)
   are also defined for the EXT-X-I-FRAME-STREAM-INF tag, except for the
   FRAME-RATE, AUDIO, SUBTITLES, and CLOSED-CAPTIONS attributes.  In
   addition, the following attribute is defined:

      URI

      The value is a quoted-string containing a URI that identifies the
      I-frame Media Playlist file.  That Playlist file MUST contain an
      EXT-X-I-FRAMES-ONLY tag.

   Every EXT-X-I-FRAME-STREAM-INF tag MUST include a BANDWIDTH attribute
   and a URI attribute.

   The provisions in Section 4.3.4.2.1 also apply to EXT-X-I-FRAME-
   STREAM-INF tags with a VIDEO attribute.

   A Master Playlist that specifies alternative VIDEO Renditions and
   I-frame Playlists SHOULD include an alternative I-frame VIDEO
   Rendition for each regular VIDEO Rendition, with the same NAME and
   Rendition for each regular VIDEO Rendition, with the same NAME and
   LANGUAGE attributes.
 */
export const EXT_X_I_FRAME_STREAM_INF_OBJECT = z
    .object({
        URI: z.string(),
        BANDWIDTH: z.number(),
        'AVERAGE-BANDWIDTH': z.number(),
        CODECS: z.array(z.string()),
        RESOLUTION: z.object({
            height: z.number(),
            width: z.number(),
        }).readonly(),
        'HDCP-LEVEL': z.enum(['TYPE-0', 'NONE']),
        VIDEO: z.string(),
    })
    .readonly();

export const EXT_X_I_FRAME_STREAM_INF_CODEC = z.codec(
    EXT_X_I_FRAME_STREAM_INF_STRING,
    EXT_X_I_FRAME_STREAM_INF_OBJECT,
    {
        decode: (value) => {
            const [tag, uri] = value.split('\n') as [
                z.infer<typeof EXT_X_I_FRAME_STREAM_INF_STRING>,
                string,
            ];
            // Parse attribute list from the tag
            const attributeListString = stripTag(tag);
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

            obj['URI'] = uri;

            if (obj['BANDWIDTH']) {
                obj['BANDWIDTH'] = +obj['BANDWIDTH'];
            }

            if (obj['AVERAGE-BANDWIDTH']) {
                obj['AVERAGE-BANDWIDTH'] = +obj['AVERAGE-BANDWIDTH'];
            }

            if (obj['CODECS']) {
                obj['CODECS'] = obj['CODECS'].split(',');
            }

            if (obj['RESOLUTION']) {
                const [w, h] = obj['RESOLUTION'].split('x');
                obj['RESOLUTION'] = {
                    height: +h,
                    width: +w,
                };
            }

            return obj;
        },
        encode: (value) => {
            const parts: string[] = [];

            // BANDWIDTH: decimal-integer - peak segment bit rate in bits per second (not quoted)
            if (value.BANDWIDTH !== undefined) {
                parts.push(`BANDWIDTH=${value.BANDWIDTH}`);
            }

            // AVERAGE-BANDWIDTH: decimal-integer - average segment bit rate (not quoted)
            if (value['AVERAGE-BANDWIDTH'] !== undefined) {
                parts.push(`AVERAGE-BANDWIDTH=${value['AVERAGE-BANDWIDTH']}`);
            }

            // CODECS: quoted-string - comma-separated list of formats (always quoted)
            if (value.CODECS !== undefined) {
                parts.push(`CODECS="${value.CODECS.join(',')}"`);
            }

            // RESOLUTION: decimal-resolution - optimal pixel resolution (not quoted)
            if (value.RESOLUTION !== undefined) {
                parts.push(`RESOLUTION=${value.RESOLUTION.width}x${value.RESOLUTION.height}`);
            }

            // HDCP-LEVEL: enumerated-string - HDCP level (not quoted)
            if (value['HDCP-LEVEL'] !== undefined) {
                parts.push(`HDCP-LEVEL=${value['HDCP-LEVEL']}`);
            }

            // VIDEO: quoted-string - video rendition group ID (always quoted)
            if (value.VIDEO !== undefined) {
                parts.push(`VIDEO="${value.VIDEO}"`);
            }

            // URI is output on a separate line, not in the attribute list
            const uri = value.URI || '';

            return `${TAG}:${parts.join(',')}\n${uri}` as any;
        },
    },
);

export type EXT_X_I_FRAME_STREAM_INF_STRING_TYPE = `#EXT-X-I-FRAME-STREAM-INF:${string}\n${string}`;
