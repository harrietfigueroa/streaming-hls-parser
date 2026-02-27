import * as z from 'zod';
import { MediaSegment, MediaSegmentOptions } from './media-segment';
import { EXTINF_CODEC } from '../playlist-tags/media-segment-tags/EXTINF/schema';
import { EXT_X_BYTERANGE_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-BYTERANGE/schema';
import { EXT_X_DISCONTINUITY_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/schema';
import { EXT_X_KEY_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-KEY/schema';
import { EXT_X_MAP_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-MAP/schema';
import { EXT_X_PROGRAM_DATE_TIME_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/schema';
import { EXT_X_DATERANGE_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/schema';

export class MediaSegmentArrayBuilder extends Map<string, MediaSegment> {
    private inProgress: Partial<MediaSegmentOptions> = {};

    public addStreamInf(extInf: z.infer<typeof EXTINF_CODEC>): void {
        this.inProgress['#EXTINF'] = extInf;
    }

    public addByteRange(byteRange: z.infer<typeof EXT_X_BYTERANGE_CODEC>): void {
        this.inProgress['#EXT-X-BYTERANGE'] = byteRange;
    }

    public addDiscontinuity(discontinuity: z.infer<typeof EXT_X_DISCONTINUITY_CODEC>): void {
        this.inProgress['#EXT-X-DISCONTINUITY'] = discontinuity;
    }

    public addKey(key: z.infer<typeof EXT_X_KEY_CODEC>): void {
        this.inProgress['#EXT-X-KEY'] = key;
    }

    public addMap(map: z.infer<typeof EXT_X_MAP_CODEC>): void {
        this.inProgress['#EXT-X-MAP'] = map;
    }

    public addProgramDateTime(
        programDateTime: z.infer<typeof EXT_X_PROGRAM_DATE_TIME_CODEC>,
    ): void {
        this.inProgress['#EXT-X-PROGRAM-DATE-TIME'] = programDateTime;
    }

    public addDateRange(dateRange: z.infer<typeof EXT_X_DATERANGE_CODEC>): void {
        this.inProgress['#EXT-X-DATERANGE'] = dateRange;
    }

    public addURI(uri: string): void {
        // When we get a URI then we're done with this segment and we can start a new one
        this.inProgress['URI'] = uri;
        this.set(uri, new MediaSegment(this.inProgress as MediaSegmentOptions));

        this.inProgress = {
            URI: undefined,
        };
    }
}
