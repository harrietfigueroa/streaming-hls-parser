/**
 * The EXT-X-VERSION tag indicates the compatibility version of the
   Playlist file, its associated media, and its server.

   The EXT-X-VERSION tag applies to the entire Playlist file.  Its
   format is:

   #EXT-X-VERSION:<n>

   where n is an integer indicating the protocol compatibility version
   number.
 */

export type EXT_X_VERSION_PARSED = number;
export type EXT_X_VERSION_STRING = `#EXT-X-VERSION:${number}`;
