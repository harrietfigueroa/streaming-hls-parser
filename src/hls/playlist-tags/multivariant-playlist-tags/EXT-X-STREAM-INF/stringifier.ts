import { EXT_X_STREAM_INF_PARSED, EXT_X_STREAM_INF_STRING } from './types';

/**
 * Stringifier for EXT-X-STREAM-INF tag
 * 
 * RFC 8216 Section 4.3.4.2:
 * - The EXT-X-STREAM-INF tag specifies a Variant Stream, which is a set
 *   of Renditions that can be combined to play the presentation.
 * - Its format is: #EXT-X-STREAM-INF:<attribute-list>
 */
export function extXStreamInfStringifier(val: EXT_X_STREAM_INF_PARSED): EXT_X_STREAM_INF_STRING {
    const attrs = [];

    if (val.BANDWIDTH !== undefined) {
        attrs.push(`BANDWIDTH=${val.BANDWIDTH}`);
    }

    if (val['AVERAGE-BANDWIDTH'] !== undefined) {
        attrs.push(`AVERAGE-BANDWIDTH=${val['AVERAGE-BANDWIDTH']}`);
    }

    if (val.CODECS !== undefined) {
        attrs.push(`CODECS="${val.CODECS.join(',')}"`);
    }

    if (val.RESOLUTION !== undefined) {
        attrs.push(`RESOLUTION=${val.RESOLUTION}`);
    }

    if (val['FRAME-RATE'] !== undefined) {
        attrs.push(`FRAME-RATE=${val['FRAME-RATE']}`);
    }

    if (val['HDCP-LEVEL'] !== undefined) {
        attrs.push(`HDCP-LEVEL=${val['HDCP-LEVEL']}`);
    }

    if (val.AUDIO !== undefined) {
        attrs.push(`AUDIO="${val.AUDIO}"`);
    }

    if (val.VIDEO !== undefined) {
        attrs.push(`VIDEO="${val.VIDEO}"`);
    }

    return `#EXT-X-STREAM-INF:${attrs.join(',')}` as EXT_X_STREAM_INF_STRING;
} 