import { MEDIA_OR_MULTIVARIANT_TAGS } from '../hls.types';

export class BasicPlaylist implements Record<MEDIA_OR_MULTIVARIANT_TAGS, any> {
    public readonly '#EXTM3U': boolean = true;
    public readonly '#EXT-X-VERSION': number = 1;
    public readonly '#EXT-X-INDEPENDENT-SEGMENTS': number = 1;
    public readonly '#EXT-X-START': number = 1;
    constructor(basicPlaylistOptions: Record<MEDIA_OR_MULTIVARIANT_TAGS, any>) {
        this['#EXTM3U'] = basicPlaylistOptions['#EXTM3U'];
        this['#EXT-X-VERSION'] = basicPlaylistOptions['#EXT-X-VERSION'];
        this['#EXT-X-INDEPENDENT-SEGMENTS'] = basicPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];
        this['#EXT-X-START'] = basicPlaylistOptions['#EXT-X-START'];
    }
}
