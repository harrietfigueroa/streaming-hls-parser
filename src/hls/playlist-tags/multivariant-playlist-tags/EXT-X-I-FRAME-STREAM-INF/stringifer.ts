import { EXT_X_I_FRAME_STREAM_INF_PARSED, EXT_X_I_FRAME_STREAM_INF_STRING } from './types';

export default function (value: EXT_X_I_FRAME_STREAM_INF_PARSED): EXT_X_I_FRAME_STREAM_INF_STRING {
    const attrs = [];
    if (value['BANDWIDTH']) {
        attrs.push(`BANDWIDTH=${value['BANDWIDTH']}`);
    }
    if (value['AVERAGE-BANDWIDTH']) {
        attrs.push(`AVERAGE-BANDWIDTH=${value['AVERAGE-BANDWIDTH']}`);
    }
    if (value['CODECS']) {
        attrs.push(`CODECS=${value['CODECS'].join(',')}`);
    }
    if (value['RESOLUTION']) {
        attrs.push(`RESOLUTION=${value['RESOLUTION']}`);
    }
    if (value['HDCP-LEVEL']) {
        attrs.push(`HDCP-LEVEL=${value['HDCP-LEVEL']}`);
    }
    if (value['VIDEO']) {
        attrs.push(`VIDEO=${value['VIDEO']}`);
    }
    return `#EXT-X-I-FRAME-STREAM-INF:${attrs.join(',')},URI="${value['URI']}"`;
}
