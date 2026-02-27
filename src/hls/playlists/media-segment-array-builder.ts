import * as z from 'zod';
import { MediaSegment, MediaSegmentOptions } from './media-segment';
import { EXTINF_CODEC } from '../playlist-tags/media-segment-tags/EXTINF/schema';
import { EXT_X_BYTERANGE_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-BYTERANGE/schema';
import { EXT_X_DISCONTINUITY_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-DISCONTINUITY/schema';
import { EXT_X_KEY_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-KEY/schema';
import { EXT_X_MAP_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-MAP/schema';
import { EXT_X_PROGRAM_DATE_TIME_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-PROGRAM-DATE-TIME/schema';
import { EXT_X_DATERANGE_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-DATERANGE/schema';
import { EXT_X_GAP_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-GAP/schema';
import { EXT_X_BITRATE_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-BITRATE/schema';
import { EXT_X_PART_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-PART/schema';
import { EXT_X_CUE_OUT_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-CUE-OUT/schema';
import { EXT_X_CUE_IN_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-CUE-IN/schema';
import { EXT_X_CUE_OUT_CONT_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-CUE-OUT-CONT/schema';
import { EXT_X_ASSET_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-ASSET/schema';
import { EXT_X_SPLICEPOINT_SCTE35_CODEC } from '../playlist-tags/media-segment-tags/EXT-X-SPLICEPOINT-SCTE35/schema';

export class MediaSegmentArrayBuilder extends Array<MediaSegment> {
    private inProgress: Partial<MediaSegmentOptions> = {};
    private inProgressErrors: Array<{
        tag: string;
        errors: ReadonlyArray<z.ZodError['issues'][number]>;
        line: string;
    }> = [];

    public addStreamInf(extInf: z.infer<typeof EXTINF_CODEC>): void {
        this.inProgress['#EXTINF'] = extInf;
    }

    public addError(tag: string, errors: ReadonlyArray<z.ZodError['issues'][number]>, line: string): void {
        this.inProgressErrors.push({ tag, errors, line });
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

    public addGap(gap: z.infer<typeof EXT_X_GAP_CODEC>): void {
        this.inProgress['#EXT-X-GAP'] = gap;
    }

    public addBitrate(bitrate: z.infer<typeof EXT_X_BITRATE_CODEC>): void {
        this.inProgress['#EXT-X-BITRATE'] = bitrate;
    }

    public addPart(part: z.infer<typeof EXT_X_PART_CODEC>): void {
        this.inProgress['#EXT-X-PART'] = part;
    }

    public addCueOut(cueOut: z.infer<typeof EXT_X_CUE_OUT_CODEC>): void {
        this.inProgress['#EXT-X-CUE-OUT'] = cueOut;
    }

    public addCueIn(cueIn: z.infer<typeof EXT_X_CUE_IN_CODEC>): void {
        this.inProgress['#EXT-X-CUE-IN'] = cueIn;
    }

    public addCueOutCont(cueOutCont: z.infer<typeof EXT_X_CUE_OUT_CONT_CODEC>): void {
        this.inProgress['#EXT-X-CUE-OUT-CONT'] = cueOutCont;
    }

    public addAsset(asset: z.infer<typeof EXT_X_ASSET_CODEC>): void {
        this.inProgress['#EXT-X-ASSET'] = asset;
    }

    public addSplicepointScte35(scte35: z.infer<typeof EXT_X_SPLICEPOINT_SCTE35_CODEC>): void {
        this.inProgress['#EXT-X-SPLICEPOINT-SCTE35'] = scte35;
    }

    public addURI(uri: string): void {
        // When we get a URI then we're done with this segment and we can start a new one
        this.inProgress['URI'] = uri;
        const errors = this.inProgressErrors.length > 0 ? this.inProgressErrors : undefined;
        this.push(new MediaSegment(this.inProgress as MediaSegmentOptions, errors));

        // Reset segment-specific tags but preserve tags that apply to multiple segments
        // Tags that persist: EXT-X-MAP, EXT-X-KEY, EXT-X-BITRATE
        // Tags that reset: EXTINF, EXT-X-BYTERANGE, EXT-X-DISCONTINUITY, EXT-X-PROGRAM-DATE-TIME,
        //                  EXT-X-DATERANGE, EXT-X-GAP, EXT-X-PART, EXT-X-CUE-*, EXT-X-ASSET, EXT-X-SPLICEPOINT-SCTE35
        this.inProgress = {
            URI: undefined,
            '#EXTINF': undefined,
            '#EXT-X-BYTERANGE': undefined,
            '#EXT-X-DISCONTINUITY': undefined,
            '#EXT-X-PROGRAM-DATE-TIME': undefined,
            '#EXT-X-DATERANGE': undefined,
            '#EXT-X-GAP': undefined,
            '#EXT-X-PART': undefined,
            '#EXT-X-CUE-OUT': undefined,
            '#EXT-X-CUE-IN': undefined,
            '#EXT-X-CUE-OUT-CONT': undefined,
            '#EXT-X-ASSET': undefined,
            '#EXT-X-SPLICEPOINT-SCTE35': undefined,
            // Keep these tags as they apply to multiple segments:
            '#EXT-X-MAP': this.inProgress['#EXT-X-MAP'],
            '#EXT-X-KEY': this.inProgress['#EXT-X-KEY'],
            '#EXT-X-BITRATE': this.inProgress['#EXT-X-BITRATE'],
        };
        this.inProgressErrors = [];
    }
}
