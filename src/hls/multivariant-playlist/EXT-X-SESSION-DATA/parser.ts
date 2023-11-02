import { quotedStringify } from '../../../helpers/quoted-stringify';
import { attributeList } from '../../common/attribute-list';
import { extractProperties } from '../../parsers/helpers/extract-properties';
import { SessionDataAttributes } from './types';

export default function (str: string): SessionDataAttributes {
    const values: SessionDataAttributes = attributeList<SessionDataAttributes>(str);
    const extractedProperties = extractProperties(values, ['DATA-ID', 'VALUE', 'URI', 'LANGUAGE']);

    return {
        'DATA-ID': extractedProperties['DATA-ID'],
        VALUE: extractedProperties['VALUE'],
        URI: extractedProperties['URI'],
        LANGUAGE: quotedStringify(extractedProperties['LANGUAGE']),
    };
}
