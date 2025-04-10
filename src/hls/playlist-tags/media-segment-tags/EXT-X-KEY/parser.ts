import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_KEY_METHOD_VALUES, EXT_X_KEY_PARSED } from './types';

export default function (str: string): EXT_X_KEY_PARSED {
    const values: EXT_X_KEY_PARSED = attributeList<EXT_X_KEY_PARSED>(str);
    const extractedProperties = extractProperties(values, [
        'METHOD',
        'URI',
        'IV',
        'KEYFORMAT',
        'KEYFORMATVERSIONS',
    ]);

    return {
        METHOD: extractedProperties['METHOD'] as EXT_X_KEY_METHOD_VALUES,
        URI: quotedStringify(extractedProperties['URI']),
        IV: extractedProperties['IV'],
        KEYFORMAT: quotedStringify(extractedProperties['KEYFORMAT']),
        KEYFORMATVERSIONS: quotedStringify(extractedProperties['KEYFORMATVERSIONS']),
    };
}
