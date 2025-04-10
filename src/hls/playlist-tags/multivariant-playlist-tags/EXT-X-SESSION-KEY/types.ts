/**
 * The EXT-X-SESSION-KEY tag allows encryption keys from Media Playlists
   to be specified in a Master Playlist.  This allows the client to
   preload these keys without having to read the Media Playlist(s)
   first.

   Its format is:

   #EXT-X-SESSION-KEY:<attribute-list>

   All attributes defined for the EXT-X-KEY tag (Section 4.3.2.4) are
   also defined for the EXT-X-SESSION-KEY, except that the value of the
   METHOD attribute MUST NOT be NONE.  If an EXT-X-SESSION-KEY is used,
   the values of the METHOD, KEYFORMAT, and KEYFORMATVERSIONS attributes
   MUST match any EXT-X-KEY with the same URI value.

   EXT-X-SESSION-KEY tags SHOULD be added if multiple Variant Streams or
   Renditions use the same encryption keys and formats.  An EXT-X-
   SESSION-KEY tag is not associated with any particular Media Playlist.

   A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY
   tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS
   attribute values.

   The EXT-X-SESSION-KEY tag is optional.
 */
export type EXT_X_SESSION_KEY = `#EXT-X-SESSION-KEY:${string}`;
