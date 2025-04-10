import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_MEDIA_PARSED } from './types';

export default function (str: string): EXT_X_MEDIA_PARSED {
    const values: EXT_X_MEDIA_PARSED = attributeList<EXT_X_MEDIA_PARSED>(str);
    const extractedProperties = extractProperties(values, [
        'TYPE',
        'URI',
        'GROUP-ID',
        'LANGUAGE',
        'ASSOC-LANGUAGE',
        'NAME',
        'DEFAULT',
        'AUTOSELECT',
        'FORCED',
        'INSTREAM-ID',
        'CHARACTERISTICS',
        'CHANNELS',
    ]);

    return {
        TYPE: extractedProperties['TYPE'] as EXT_X_MEDIA_PARSED['TYPE'],
        URI: extractedProperties['URI'],
        'GROUP-ID': quotedStringify(extractedProperties['GROUP-ID']),
        LANGUAGE: quotedStringify(extractedProperties['LANGUAGE']),
        'ASSOC-LANGUAGE': quotedStringify(extractedProperties['ASSOC-LANGUAGE']),
        NAME: quotedStringify(extractedProperties['NAME']),
        DEFAULT: extractedProperties['DEFAULT'] as EXT_X_MEDIA_PARSED['DEFAULT'],
        AUTOSELECT: extractedProperties['AUTOSELECT'] as EXT_X_MEDIA_PARSED['AUTOSELECT'],
        FORCED: extractedProperties['FORCED'] as EXT_X_MEDIA_PARSED['FORCED'],
        'INSTREAM-ID': extractedProperties['INSTREAM-ID'] as EXT_X_MEDIA_PARSED['INSTREAM-ID'],
        CHARACTERISTICS: extractedProperties['CHARACTERISTICS']?.split(',').map(quotedStringify),
        CHANNELS: quotedStringify(extractedProperties['CHANNELS']),
    };
}
