import { EXT_X_I_FRAME_STREAM_INF_PARSED, EXT_X_I_FRAME_STREAM_INF_STRING } from './types';

/**
 * Stringifier for EXT-X-I-FRAME-STREAM-INF tag
 * 
 * RFC 8216 Section 4.3.4.3:
 * - The EXT-X-I-FRAME-STREAM-INF tag identifies a Media Playlist file
 *   containing the I-frames of a multimedia presentation.
 * - Its format is: #EXT-X-I-FRAME-STREAM-INF:<attribute-list>
 */
export function extXIFrameStreamInfStringifier(value: EXT_X_I_FRAME_STREAM_INF_PARSED): EXT_X_I_FRAME_STREAM_INF_STRING {
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
    return `#EXT-X-I-FRAME-STREAM-INF:${attrs.join(',')},URI="${value['URI']}"` as EXT_X_I_FRAME_STREAM_INF_STRING;
} 