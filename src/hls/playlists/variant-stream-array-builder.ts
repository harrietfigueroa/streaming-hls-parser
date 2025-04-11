import { EXT_X_STREAM_INF_PARSED } from '../playlist-tags/multivariant-playlist-tags/EXT-X-STREAM-INF/types';
import { VariantStream, VariantStreamOptions } from './variant-stream';

export class VariantStreamsArrayBuilder extends Array<VariantStream> {
    private inProgress: Partial<VariantStreamOptions> | undefined;
    public addStreamInf(streamInf: EXT_X_STREAM_INF_PARSED): VariantStreamsArrayBuilder {
        this.inProgress = streamInf;
        return this;
    }

    public addURI(uri: string): void {
        if (this.inProgress) {
            // When we get a URI then we're done with this segment and we can start a new one
            this.inProgress['URI'] = uri;
            this.push(new VariantStream(this.inProgress as VariantStreamOptions));
        }
        this.inProgress = {};
    }
}
