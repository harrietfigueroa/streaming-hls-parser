import { MULTIVARIANT_PLAYLIST_TAGS } from '../hls.types';
import { BasicPlaylist } from '../playlists/basic-playlist';

export class MultivariantPlaylist
    extends BasicPlaylist
    implements Record<MULTIVARIANT_PLAYLIST_TAGS, unknown>
{
    public '#EXT-X-MEDIA': unknown;
    public '#EXT-X-STREAM-INF': unknown;
    public '#EXT-X-I-FRAME-STREAM-INF': unknown;
    public '#EXT-X-SESSION-DATA': unknown;
    public '#EXT-X-SESSION-KEY': unknown;

    constructor(multivariantPlaylistOptions: Record<MULTIVARIANT_PLAYLIST_TAGS, any>) {
        super(multivariantPlaylistOptions);

        this['#EXT-X-MEDIA'] = multivariantPlaylistOptions['#EXT-X-MEDIA'];
        this['#EXT-X-STREAM-INF'] = multivariantPlaylistOptions['#EXT-X-STREAM-INF'];
        this['#EXT-X-I-FRAME-STREAM-INF'] =
            multivariantPlaylistOptions['#EXT-X-I-FRAME-STREAM-INF'];
        this['#EXT-X-SESSION-DATA'] = multivariantPlaylistOptions['#EXT-X-SESSION-DATA'];
        this['#EXT-X-SESSION-KEY'] = multivariantPlaylistOptions['#EXT-X-SESSION-KEY'];
    }
}
