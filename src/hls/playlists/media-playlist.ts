import { pipeline, Readable } from 'node:stream';
import HLSTag from '../../hls/hls-tag';
import { HlsLexicalTransformer } from '../../transformers/hls-lexical.transformer';
import { MediaPlaylistIngestTransformer } from '../../transformers/media-playlist/media-playlist.injest.transformer';
import { NewlineTransformer } from '../../transformers/newline.transformer';
import { MEDIA_PLAYLIST_TAGS } from '../hls.types';
import { EXT_X_VERSION_PARSED } from '../playlist-tags/basic-tags/EXT-X-VERSION/types';
import { EXTM3U_PARSED } from '../playlist-tags/basic-tags/EXTM3U/types';
import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-INDEPENDENT-SEGMENTS/types';
import { EXT_X_START_PARSED } from '../playlist-tags/media-or-multivariant-playlist-tags/EXT-X-START/types';
import { EXT_X_ENDLIST_PARSED } from '../playlist-tags/media-playlist-tags/EXT-ENDLIST/types';
import { EXT_X_DISCONTINUITY_SEQUENCE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-DISCONTINUITY-SEQUENCE/types';
import { EXT_X_I_FRAMES_ONLY_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-I-FRAMES-ONLY/types';
import { EXT_X_MEDIA_SEQUENCE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-MEDIA-SEQUENCE/types';
import { EXT_X_PLAYLIST_TYPE_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-PLAYLIST-TYPE/types';
import { EXT_X_TARGETDURATION_PARSED } from '../playlist-tags/media-playlist-tags/EXT-X-TARGETDURATION/types';
import { MediaSegment } from './media-segment';
import { MediaSegmentArrayBuilder } from './media-segment-array-builder';
import { MediaSegmentIngestTransformer } from '../../transformers/media-segment-playlist/media-segment.injest.transformer';

export interface MediaPlaylistOptions extends Record<MEDIA_PLAYLIST_TAGS, unknown> {
    '#EXTM3U': EXTM3U_PARSED;
    '#EXT-X-VERSION': EXT_X_VERSION_PARSED;
    '#EXT-X-TARGETDURATION': EXT_X_TARGETDURATION_PARSED;
    '#EXT-X-MEDIA-SEQUENCE': EXT_X_MEDIA_SEQUENCE_PARSED;
    '#EXT-X-DISCONTINUITY-SEQUENCE': EXT_X_DISCONTINUITY_SEQUENCE_PARSED;
    '#EXT-X-ENDLIST': EXT_X_ENDLIST_PARSED;
    '#EXT-X-PLAYLIST-TYPE': EXT_X_PLAYLIST_TYPE_PARSED;
    '#EXT-X-I-FRAMES-ONLY': EXT_X_I_FRAMES_ONLY_PARSED;
    '#EXT-X-INDEPENDENT-SEGMENTS': EXT_X_INDEPENDENT_SEGMENTS_PARSED;
    '#EXT-X-START': EXT_X_START_PARSED;
    mediaSegments: MediaSegmentArrayBuilder;
}

export class MediaPlaylist extends Map<string, MediaSegment> {
    public readonly '#EXTM3U': MediaPlaylistOptions['#EXTM3U'];
    public readonly '#EXT-X-VERSION': MediaPlaylistOptions['#EXT-X-VERSION'];
    public readonly '#EXT-X-TARGETDURATION': MediaPlaylistOptions['#EXT-X-TARGETDURATION'];
    public readonly '#EXT-X-MEDIA-SEQUENCE': MediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'];
    public readonly '#EXT-X-DISCONTINUITY-SEQUENCE': MediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'];
    public readonly '#EXT-X-ENDLIST': MediaPlaylistOptions['#EXT-X-ENDLIST'];
    public readonly '#EXT-X-PLAYLIST-TYPE': MediaPlaylistOptions['#EXT-X-PLAYLIST-TYPE'];
    public readonly '#EXT-X-I-FRAMES-ONLY': MediaPlaylistOptions['#EXT-X-I-FRAMES-ONLY'];
    public readonly '#EXT-X-INDEPENDENT-SEGMENTS': MediaPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'];
    public readonly '#EXT-X-START': MediaPlaylistOptions['#EXT-X-START'];

    private constructor(
        mediaPlaylistOptions: MediaPlaylistOptions,
        mediaSegments: MediaSegmentArrayBuilder,
    ) {
        super(Array.from(mediaSegments, (mediaSegment) => [mediaSegment.URI, mediaSegment]));
        Object.assign(this, mediaPlaylistOptions);
    }

    static async fromStream(stream: Readable): Promise<MediaPlaylist> {
        const fromStreamPipeline = stream
            .pipe(new NewlineTransformer())
            .pipe(new HlsLexicalTransformer())
            .pipe(new MediaPlaylistIngestTransformer())
            .pipe(new MediaSegmentIngestTransformer());

        const mediaPlaylistOptions: Partial<MediaPlaylistOptions> = {};
        const mediaSegmentsBuilder = new MediaSegmentArrayBuilder();

        let parsingSegments: boolean = false;
        for await (const token of fromStreamPipeline) {
            if (token.type === HLSTag('#EXT-X-ENDLIST')) {
                mediaPlaylistOptions['#EXT-X-ENDLIST'] = token.value as any;
            }

            if (parsingSegments == false) {
                switch (token.type) {
                    case HLSTag('#EXTM3U'): {
                        mediaPlaylistOptions['#EXTM3U'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-VERSION'): {
                        mediaPlaylistOptions['#EXT-X-VERSION'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-TARGETDURATION'): {
                        mediaPlaylistOptions['#EXT-X-TARGETDURATION'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-MEDIA-SEQUENCE'): {
                        mediaPlaylistOptions['#EXT-X-MEDIA-SEQUENCE'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-DISCONTINUITY-SEQUENCE'): {
                        mediaPlaylistOptions['#EXT-X-DISCONTINUITY-SEQUENCE'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-ENDLIST'): {
                        mediaPlaylistOptions['#EXT-X-ENDLIST'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-PLAYLIST-TYPE'): {
                        mediaPlaylistOptions['#EXT-X-PLAYLIST-TYPE'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-I-FRAMES-ONLY'): {
                        mediaPlaylistOptions['#EXT-X-I-FRAMES-ONLY'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-INDEPENDENT-SEGMENTS'): {
                        mediaPlaylistOptions['#EXT-X-INDEPENDENT-SEGMENTS'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXT-X-START'): {
                        mediaPlaylistOptions['#EXT-X-START'] = token.value as any;
                        break;
                    }
                    case HLSTag('#EXTINF'): {
                        parsingSegments = true;
                        break;
                    }
                }
            }

            if (parsingSegments) {
                switch (token.type) {
                    case HLSTag('#EXTINF'): {
                        mediaSegmentsBuilder.addStreamInf(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-BYTERANGE'): {
                        mediaSegmentsBuilder.addByteRange(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-DISCONTINUITY'): {
                        mediaSegmentsBuilder.addDiscontinuity(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-KEY'): {
                        mediaSegmentsBuilder.addKey(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-MAP'): {
                        mediaSegmentsBuilder.addMap(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-PROGRAM-DATE-TIME'): {
                        mediaSegmentsBuilder.addProgramDateTime(token.value as any);
                        break;
                    }
                    case HLSTag('#EXT-X-DATERANGE'): {
                        mediaSegmentsBuilder.addDateRange(token.value as any);
                        break;
                    }
                    case HLSTag('URI'): {
                        mediaSegmentsBuilder.addURI(token.value as any);
                        break;
                    }
                }
            }
        }
        return new MediaPlaylist(
            mediaPlaylistOptions as MediaPlaylistOptions,
            mediaSegmentsBuilder,
        );
    }
}
