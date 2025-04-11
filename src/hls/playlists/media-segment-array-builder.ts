import { EXT_X_BYTERANGE_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-BYTERANGE/types';
import { EXT_X_DATERANGE_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/type';
import { EXT_X_DISCONTINUITY_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/types';
import { EXT_X_KEY_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-KEY/types';
import { EXT_X_MAP_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-MAP/types';
import { EXT_X_PROGRAM_DATE_TIME_PARSED } from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/types';
import { EXTINF_PARSED } from '../playlist-tags/media-segment-tags/EXTINF/types';
import { MediaSegment, MediaSegmentOptions } from './media-segment';

export class MediaSegmentArrayBuilder extends Array<MediaSegment> {
    private inProgress: Partial<MediaSegmentOptions> = {};

    public addStreamInf(extInf: EXTINF_PARSED): void {
        this.inProgress['#EXTINF'] = extInf;
    }

    public addByteRange(byteRange: EXT_X_BYTERANGE_PARSED): void {
        this.inProgress['#EXT-X-BYTERANGE'] = byteRange;
    }

    public addDiscontinuity(discontinuity: EXT_X_DISCONTINUITY_PARSED): void {
        this.inProgress['#EXT-X-DISCONTINUITY'] = discontinuity;
    }

    public addKey(key: EXT_X_KEY_PARSED): void {
        this.inProgress['#EXT-X-KEY'] = key;
    }

    public addMap(map: EXT_X_MAP_PARSED): void {
        this.inProgress['#EXT-X-MAP'] = map;
    }

    public addProgramDateTime(programDateTime: EXT_X_PROGRAM_DATE_TIME_PARSED): void {
        this.inProgress['#EXT-X-PROGRAM-DATE-TIME'] = programDateTime;
    }

    public addDateRange(dateRange: EXT_X_DATERANGE_PARSED): void {
        this.inProgress['#EXT-X-DATERANGE'] = dateRange;
    }

    public addURI(uri: string): void {
        // When we get a URI then we're done with this segment and we can start a new one
        this.inProgress['URI'] = uri;
        this.push(new MediaSegment(this.inProgress as MediaSegmentOptions));

        this.inProgress = {};
    }
}
