/**
 * The EXT-X-PLAYLIST-TYPE tag provides mutability information about the
   Media Playlist file.  It applies to the entire Media Playlist file.
   It is OPTIONAL.  Its format is:

   #EXT-X-PLAYLIST-TYPE:<type-enum>

   where type-enum is either EVENT or VOD.

   Section 6.2.1 defines the implications of the EXT-X-PLAYLIST-TYPE
   tag.

   If the EXT-X-PLAYLIST-TYPE value is EVENT, Media Segments can only be
   added to the end of the Media Playlist.  If the EXT-X-PLAYLIST-TYPE
   value is Video On Demand (VOD), the Media Playlist cannot change.

   If the EXT-X-PLAYLIST-TYPE tag is omitted from a Media Playlist, the
   Playlist can be updated according to the rules in Section 6.2.1 with
   no additional restrictions.  For example, a live Playlist
   (Section 6.2.2) MAY be updated to remove Media Segments in the order
   that they appeared.
 */
export type EXT_X_PLAYLIST_TYPE = `#EXT-X-PLAYLIST-TYPE:${PlaylistTypeEnum}`;

export enum PlaylistTypeEnum {
    EVENT = 'EVENT',
    VOD = 'VOD',
}
