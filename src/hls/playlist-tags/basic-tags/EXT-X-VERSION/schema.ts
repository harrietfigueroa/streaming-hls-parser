import * as z from 'zod';
import { stripTag } from '../../../parse-helpers/strip-tag';

export const TAG = '#EXT-X-VERSION' as const;
export const EXT_X_VERSION_STRING = z.templateLiteral([TAG, ':', z.number().int().min(1).max(7)]);

/**
 * The EXT-X-VERSION tag indicates the compatibility version of the
 * Playlist file, its associated media, and its server.
 *
 * The EXT-X-VERSION tag applies to the entire Playlist file. Its
 * format is:
 *
 * #EXT-X-VERSION:<n>
 *
 * where n is an integer indicating the protocol compatibility version
 * number.
 *
 * The EXT-X-VERSION tag is optional. A Playlist file MUST NOT contain
 * more than one EXT-X-VERSION tag. A Playlist file that does not
 * contain an EXT-X-VERSION tag MUST comply with version 1 of this
 * protocol.
 *
 * The EXT-X-VERSION tag MUST appear before the first media segment
 * in the Playlist.
 */
export const EXT_X_VERSION_OBJECT = z.number().int().min(1).max(7).describe(`
    The EXT-X-VERSION tag indicates the compatibility version of the
    Playlist file, its associated media, and its server.

    The EXT-X-VERSION tag applies to the entire Playlist file. Its
    format is:

    #EXT-X-VERSION:<n>

    where n is an integer indicating the protocol compatibility version
    number.

    The EXT-X-VERSION tag is optional. A Playlist file MUST NOT contain
    more than one EXT-X-VERSION tag. A Playlist file that does not
    contain an EXT-X-VERSION tag MUST comply with version 1 of this
    protocol.

    The EXT-X-VERSION tag MUST appear before the first media segment
    in the Playlist.
`);

export const EXT_X_VERSION_CODEC = z.codec(EXT_X_VERSION_STRING, EXT_X_VERSION_OBJECT, {
    decode: (value) => {
        return +stripTag(value);
    },
    encode: (version) => {
        return `${TAG}:${version}` as any;
    },
});

export type EXT_X_VERSION_STRING_TYPE = `#EXT-X-VERSION:${number}`;
