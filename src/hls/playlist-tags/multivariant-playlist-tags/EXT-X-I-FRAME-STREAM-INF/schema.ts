import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
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
export const EXT_X_I_FRAME_STREAM_INF_OBJECT = z.object({
    URI: z.string(),
    BANDWIDTH: z.number(),
    'AVERAGE-BANDWIDTH': z.number(),
    CODECS: z.array(z.string()),
    RESOLUTION: z.object({
        height: z.number(),
        width: z.number(),
    }),
    'HDCP-LEVEL': z.enum(['TYPE-0', 'NONE']),
    VIDEO: z.string(),
});

export const EXT_X_I_FRAME_STREAM_INF_CODEC = z.codec(
    EXT_X_I_FRAME_STREAM_INF_STRING,
    EXT_X_I_FRAME_STREAM_INF_OBJECT,
    {
        decode: (value) => {
            const [tag, uri] = value.split('\n') as [
                z.infer<typeof EXT_X_I_FRAME_STREAM_INF_STRING>,
                string,
            ];
            const obj: any = fromAttributeList(stripTag(tag));

            obj['URI'] = uri;

            if (obj['BANDWIDTH']) {
                obj['BANDWIDTH'] = +obj['BANDWIDTH'];
            }

            if (obj['AVERAGE-BANDWIDTH']) {
                obj['AVERAGE-BANDWIDTH'] = +obj['AVERAGE-BANDWIDTH'];
            }

            if (obj['CODECS']) {
                const codecs = obj['CODECS'].replace(/^"|"$/g, '').split(',');
                obj['CODECS'] = codecs;
            }

            if (obj['RESOLUTION']) {
                const [w, h] = obj['RESOLUTION'].split('x');
                obj['RESOLUTION'] = {
                    height: +h,
                    width: +w,
                };
            }

            if (obj['VIDEO']) {
                obj['VIDEO'] = obj['VIDEO'].replace(/^"|"$/g, '');
            }

            return obj;
        },
        encode: (value) => {
            const preEncoded: Record<string, unknown> = {
                ...value,
            };

            if (value['CODECS']) {
                preEncoded['CODECS'] = `"${value['CODECS'].join(',')}"`;
            }

            if (value['RESOLUTION']) {
                preEncoded[
                    'RESOLUTION'
                ] = `${value['RESOLUTION'].width}x${value['RESOLUTION'].height}`;
            }

            if (value['VIDEO']) {
                preEncoded['VIDEO'] = `"${value['VIDEO']}"`;
            }
            const uri = preEncoded['URI'];
            delete preEncoded['URI'];

            return `${TAG}:${toAttributeList(preEncoded)}\n${uri}` as any;
        },
    },
);

export type EXT_X_I_FRAME_STREAM_INF_STRING_TYPE = `#EXT-X-I-FRAME-STREAM-INF:${string}\n${string}`;
