import { BasicPlaylist } from '../../playlists/basic-playlist';
import { MEDIA_PLAYLIST_TAGS } from '../../hls.types';
import { MediaSegment } from '../../playlists/media-segment';

export enum PlaylistType {
    EVENT = 'EVENT',
    VOD = 'VOD',
}

export class MediaPlaylist extends BasicPlaylist implements Record<MEDIA_PLAYLIST_TAGS, unknown> {
    public '#EXT-X-TARGETDURATION': number;
    public '#EXT-X-MEDIA-SEQUENCE': number;
    public '#EXT-X-DISCONTINUITY-SEQUENCE': number;
    public '#EXT-X-ENDLIST': boolean;
    public '#EXT-X-PLAYLIST-TYPE': PlaylistType;
    public '#EXT-X-I-FRAMES-ONLY': boolean;
    public mediaSegments: MediaSegment[] = [];
    constructor(mediaPlaylistOptions: Record<MEDIA_PLAYLIST_TAGS, any>) {
        super(mediaPlaylistOptions);

        this['#EXT-X-TARGETDURATION'] = mediaPlaylistOptions['#EXT-X-TARGETDURATION'];
        this['#EXT-X-MEDIA-SEQUENCE'] = mediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'];
        this['#EXT-X-MEDIA-SEQUENCE'] = mediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'];
        this['#EXT-X-DISCONTINUITY-SEQUENCE'] =
            mediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'];
        this['#EXT-X-ENDLIST'] = mediaPlaylistOptions['#EXT-X-ENDLIST'];
        this['#EXT-X-PLAYLIST-TYPE'] = mediaPlaylistOptions['#EXT-X-PLAYLIST-TYPE'];
        this['#EXT-X-I-FRAMES-ONLY'] = mediaPlaylistOptions['#EXT-X-I-FRAMES-ONLY'];
    }
}
