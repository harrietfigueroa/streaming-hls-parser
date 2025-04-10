import { MEDIA_SEGMENT_TAGS } from '../../hls.types';

export class MediaSegment implements Record<MEDIA_SEGMENT_TAGS, unknown> {
    public ['#EXTINF']: number;
    public ['#EXT-X-BYTERANGE']: unknown;
    public ['#EXT-X-DISCONTINUITY']: unknown;
    public ['#EXT-X-KEY']: unknown;
    public ['#EXT-X-MAP']: unknown;
    public ['#EXT-X-PROGRAM-DATE-TIME']: unknown;
    public ['#EXT-X-DATERANGE']: unknown;

    constructor(mediaSegmentOptions: Record<MEDIA_SEGMENT_TAGS, unknown>) {
        this['#EXTINF'] = mediaSegmentOptions['#EXTINF'];
        this['#EXT-X-BYTERANGE'] = mediaSegmentOptions['#EXT-X-BYTERANGE'];
        this['#EXT-X-DISCONTINUITY'] = mediaSegmentOptions['#EXT-X-DISCONTINUITY'];
        this['#EXT-X-KEY'] = mediaSegmentOptions['#EXT-X-KEY'];
        this['#EXT-X-MAP'] = mediaSegmentOptions['#EXT-X-MAP'];
        this['#EXT-X-PROGRAM-DATE-TIME'] = mediaSegmentOptions['#EXT-X-PROGRAM-DATE-TIME'];
        this['#EXT-X-DATERANGE'] = mediaSegmentOptions['#EXT-X-DATERANGE'];
    }
}
