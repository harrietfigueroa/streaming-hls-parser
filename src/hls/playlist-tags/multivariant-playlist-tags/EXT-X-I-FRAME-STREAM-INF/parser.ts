import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { extXStreamInfParser } from '../EXT-X-STREAM-INF/parser';
import { EXT_X_I_FRAME_STREAM_INF_PARSED, EXT_X_I_FRAME_STREAM_INF_STRING } from './types';

// Generic parser type for type inference
type ExtXIFrameStreamInfParser<T extends string> = T extends EXT_X_I_FRAME_STREAM_INF_STRING ? EXT_X_I_FRAME_STREAM_INF_PARSED : never;

/**
 * Parser for EXT-X-I-FRAME-STREAM-INF tag
 * 
 * RFC 8216 Section 4.3.4.3:
 * - The EXT-X-I-FRAME-STREAM-INF tag identifies a Media Playlist file
 *   containing the I-frames of a multimedia presentation.
 * - Its format is: #EXT-X-I-FRAME-STREAM-INF:<attribute-list>
 */
export function extXIFrameStreamInfParser<T extends string>(str: T): ExtXIFrameStreamInfParser<T> {
    const sharedProperties = extXStreamInfParser(str);
    const values: EXT_X_I_FRAME_STREAM_INF_PARSED =
        attributeList<EXT_X_I_FRAME_STREAM_INF_PARSED>(str);
    const extractedValues = extractProperties(values, ['URI']);

    // Simple extraction - no validation
    const result = {
        ...sharedProperties,
        URI: extractedValues['URI'],
    };

    return result as unknown as ExtXIFrameStreamInfParser<T>;
} 