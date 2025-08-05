import { numberfy } from '../../../../helpers/numberfy';
import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { yesnoify } from '../../../../helpers/yesnoify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_STREAM_INF_PARSED, EXT_X_STREAM_INF_STRING } from './types';

// Generic parser type for type inference
type ExtXStreamInfParser<T extends string> = T extends EXT_X_STREAM_INF_STRING ? EXT_X_STREAM_INF_PARSED : never;

/**
 * Parser for EXT-X-STREAM-INF tag
 * 
 * RFC 8216 Section 4.3.4.2:
 * - The EXT-X-STREAM-INF tag specifies a Variant Stream, which is a set
 *   of Renditions that can be combined to play the presentation.
 * - Its format is: #EXT-X-STREAM-INF:<attribute-list>
 */
export function extXStreamInfParser<T extends string>(str: T): ExtXStreamInfParser<T> {
    const values: EXT_X_STREAM_INF_PARSED = attributeList<EXT_X_STREAM_INF_PARSED>(str);
    const extractedValues = extractProperties(values, [
        'BANDWIDTH',
        'AVERAGE-BANDWIDTH',
        'CODECS',
        'RESOLUTION',
        'FRAME-RATE',
        'HDCP-LEVEL',
        'AUDIO',
        'VIDEO',
    ]);

    // Simple extraction - no validation
    return {
        BANDWIDTH: numberfy(extractedValues['BANDWIDTH']),
        'AVERAGE-BANDWIDTH': numberfy(extractedValues['AVERAGE-BANDWIDTH']),
        RESOLUTION: numberfy(extractedValues['RESOLUTION']),
        'FRAME-RATE': numberfy(extractedValues['FRAME-RATE']),
        CODECS: extractedValues['CODECS']?.split(',').map(quotedStringify),
        'HDCP-LEVEL': extractedValues['HDCP-LEVEL'] as EXT_X_STREAM_INF_PARSED['HDCP-LEVEL'],
        AUDIO: yesnoify(extractedValues['AUDIO'], true),
        VIDEO: yesnoify(extractedValues['VIDEO'], true),
    } as ExtXStreamInfParser<T>;
} 