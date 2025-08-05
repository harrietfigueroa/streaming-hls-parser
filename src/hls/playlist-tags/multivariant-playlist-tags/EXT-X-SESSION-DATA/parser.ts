import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_SESSION_DATA_PARSED, EXT_X_SESSION_DATA_STRING } from './types';

// Generic parser type for type inference
type ExtXSessionDataParser<T extends string> = T extends EXT_X_SESSION_DATA_STRING ? EXT_X_SESSION_DATA_PARSED : never;

export function extXSessionDataParser<T extends string>(str: T): ExtXSessionDataParser<T> {
    const values: EXT_X_SESSION_DATA_PARSED = attributeList<EXT_X_SESSION_DATA_PARSED>(str);
    const extractedProperties = extractProperties(values, ['DATA-ID', 'VALUE', 'URI', 'LANGUAGE']);

    // Simple extraction - no validation
    return {
        'DATA-ID': extractedProperties['DATA-ID'],
        VALUE: extractedProperties['VALUE'],
        URI: extractedProperties['URI'],
        LANGUAGE: quotedStringify(extractedProperties['LANGUAGE']),
    } as ExtXSessionDataParser<T>;
}

export default extXSessionDataParser;
