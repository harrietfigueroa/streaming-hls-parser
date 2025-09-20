import * as z from 'zod';
import { fromAttributeList, toAttributeList } from '../../../parse-helpers/attribute-list';
import { byterangeCodec } from '../../../parse-helpers/byterange';
import { EXT_X_BYTERANGE } from '../EXT-X-BYTERANGE/schema';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-MAP' as const;
export const EXT_X_MAP_STRING = z.templateLiteral([TAG, ':', z.string()]);

export const EXT_X_MAP_OBJECT = z.object({
    /**
     * URI
     * The value is a quoted-string containing a URI that identifies a
     * resource that contains the Media Initialization Section.  This
     * attribute is REQUIRED.
     */
    URI: z.string(),

    /*
     * BYTERANGE
     * The value is a quoted-string specifying a byte range into the
     * resource identified by the URI attribute.  This range SHOULD
     * contain only the Media Initialization Section.  The format of the
     * byte range is described in Section 4.3.2.2.  This attribute is
     * OPTIONAL; if it is not present, the byte range is the entire
     * resource indicated by the URI.
     */
    BYTERANGE: EXT_X_BYTERANGE,
});

/**
 * The EXT-X-MAP tag specifies how to obtain the Media Initialization
 * Section.  It applies to every Media Segment that appears after it in
 * the Playlist until the next EXT-X-MAP tag (if any) with the same
 * URI attribute value.  Its format is:

   #EXT-X-MAP:<attribute-list>

   where attribute-list contains one or more of the following
   attribute/value pairs:

   URI=<uri>
   BYTERANGE=<n>[@<o>]

   where uri is a quoted-string; n and o are decimal-integers.

   An EXT-X-MAP tag SHOULD be supplied for Media Segments in Playlists
   with the EXT-X-I-FRAMES-ONLY tag when the first Media Segment (i.e.,
   I-frame) in the Playlist (or the first segment following an EXT-
   X-DISCONTINUITY tag) does not immediately follow the Media
   Initialization Section at the beginning of its resource.

   Use of the EXT-X-MAP tag in a Media Playlist that contains the EXT-
   X-I-FRAMES-ONLY tag REQUIRES a compatibility version number of 5 or
   greater.  Use of the EXT-X-MAP tag in a Media Playlist that DOES NOT
   contain the EXT-X-I-FRAMES-ONLY tag REQUIRES a compatibility version
   number of 6 or greater.

   If the Media Initialization Section declared by an EXT-X-MAP tag is
   encrypted with a METHOD of AES-128, the IV attribute of the EXT-X-KEY
   tag that applies to the EXT-X-MAP is REQUIRED.
 */

export const EXT_X_MAP_CODEC = z.codec(EXT_X_MAP_STRING, EXT_X_MAP_OBJECT, {
    decode: (value) => {
        const obj: any = fromAttributeList(stripTag(value));
        if (typeof obj.BYTERANGE === 'string') {
            let byterange: z.infer<typeof EXT_X_BYTERANGE>;
            if (obj.BYTERANGE.includes('@')) {
                const [n, o] = obj.BYTERANGE.split('@');
                byterange = { n: +n, o: +o };
            } else {
                byterange = { n: +obj.BYTERANGE };
            }
            obj.BYTERANGE = byterange;
        }
        return obj;
    },
    encode: (obj) => {
        const preEncoded: Record<string, unknown> = {
            ...obj,
        };

        if (obj.URI) {
            preEncoded.URI = `"${obj.URI}"`;
        }

        if (obj.BYTERANGE) {
            preEncoded.BYTERANGE = obj.BYTERANGE.o
                ? `"${obj.BYTERANGE.n}@${obj.BYTERANGE.o}"`
                : `"${obj.BYTERANGE.n}"`;
        }
        return `${TAG}:${toAttributeList(preEncoded)}` as any;
    },
});
