import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_SESSION_DATA_PARSED } from './types';

export default function (str: string): EXT_X_SESSION_DATA_PARSED {
    const values: EXT_X_SESSION_DATA_PARSED = attributeList<EXT_X_SESSION_DATA_PARSED>(str);
    const extractedProperties = extractProperties(values, ['DATA-ID', 'VALUE', 'URI', 'LANGUAGE']);

    return {
        'DATA-ID': extractedProperties['DATA-ID'],
        VALUE: extractedProperties['VALUE'],
        URI: extractedProperties['URI'],
        LANGUAGE: quotedStringify(extractedProperties['LANGUAGE']),
    };
}
