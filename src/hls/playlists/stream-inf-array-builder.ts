import * as z from 'zod';
import { StreamInf, VariantStreamOptions } from './stream-inf';
import { EXT_X_STREAM_INF_CODEC } from '../playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/schema';

export class StreamInfArrayBuilder extends Map<string, StreamInf> {
    private inProgress: Partial<
        Record<keyof VariantStreamOptions, VariantStreamOptions[keyof VariantStreamOptions]>
    > = {
        BANDWIDTH: undefined,
        'AVERAGE-BANDWIDTH': undefined,
        CODECS: undefined,
        RESOLUTION: undefined,
        'FRAME-RATE': undefined,
        'HDCP-LEVEL': undefined,
        AUDIO: undefined,
        VIDEO: undefined,
        URI: undefined,
    };
    public addStreamInf(streamInf: z.infer<typeof EXT_X_STREAM_INF_CODEC>): StreamInfArrayBuilder {
        this.inProgress['BANDWIDTH'] = streamInf['BANDWIDTH'];
        this.inProgress['AVERAGE-BANDWIDTH'] = streamInf['AVERAGE-BANDWIDTH'];
        this.inProgress['CODECS'] = streamInf['CODECS'];
        this.inProgress['RESOLUTION'] = streamInf['RESOLUTION'];
        this.inProgress['FRAME-RATE'] = streamInf['FRAME-RATE'];
        this.inProgress['HDCP-LEVEL'] = streamInf['HDCP-LEVEL'];
        this.inProgress['AUDIO'] = streamInf['AUDIO'];
        return this;
    }

    public addURI(uri: string): void {
        // When we get a URI then we're done with this segment and we can start a new one
        this.inProgress['URI'] = uri;
        this.set(uri, StreamInf.fromOptions(this.inProgress as VariantStreamOptions));

        this.inProgress = {
            BANDWIDTH: undefined,
            'AVERAGE-BANDWIDTH': undefined,
            CODECS: undefined,
            RESOLUTION: undefined,
            'FRAME-RATE': undefined,
            'HDCP-LEVEL': undefined,
            AUDIO: undefined,
            VIDEO: undefined,
            URI: undefined,
        };
    }
}
