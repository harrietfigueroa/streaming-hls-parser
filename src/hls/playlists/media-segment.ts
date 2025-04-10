import { EXT_X_BYTERANGE_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-BYTERANGE/types';
import { EXT_X_DATERANGE_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/type';
import { EXT_X_DISCONTINUITY_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/types';
import { EXT_X_KEY_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-KEY/types';
import { EXT_X_MAP_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-MAP/types';
import { EXT_X_PROGRAM_DATE_TIME_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/types';
import { EXTINF_PARSED } from '../playlist-tags/media-segment-tags/EXTINF/types';

export interface MediaSegmentOptions {
    '#EXTINF': EXTINF_PARSED;
    '#EXT-X-BYTERANGE': EXT_X_BYTERANGE_PARSED;
    '#EXT-X-DISCONTINUITY': EXT_X_DISCONTINUITY_PARSED;
    '#EXT-X-KEY': EXT_X_KEY_PARSED;
    '#EXT-X-MAP': EXT_X_MAP_PARSED;
    '#EXT-X-PROGRAM-DATE-TIME': EXT_X_PROGRAM_DATE_TIME_PARSED;
    '#EXT-X-DATERANGE': EXT_X_DATERANGE_PARSED;
    URI: string;
}
export class MediaSegment {
    public readonly '#EXTINF': MediaSegmentOptions['#EXTINF'];
    public readonly '#EXT-X-BYTERANGE': MediaSegmentOptions['#EXT-X-BYTERANGE'];
    public readonly '#EXT-X-DISCONTINUITY': MediaSegmentOptions['#EXT-X-DISCONTINUITY'];
    public readonly '#EXT-X-KEY': MediaSegmentOptions['#EXT-X-KEY'];
    public readonly '#EXT-X-MAP': MediaSegmentOptions['#EXT-X-MAP'];
    public readonly '#EXT-X-PROGRAM-DATE-TIME': MediaSegmentOptions['#EXT-X-PROGRAM-DATE-TIME'];
    public readonly '#EXT-X-DATERANGE': MediaSegmentOptions['#EXT-X-DATERANGE'];
    public readonly 'URI': MediaSegmentOptions['URI'];

    constructor(mediaSegmentOptions: MediaSegmentOptions) {
        Object.assign(this, mediaSegmentOptions);
    }
}
