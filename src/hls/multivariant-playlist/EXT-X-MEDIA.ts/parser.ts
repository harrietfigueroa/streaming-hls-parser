import { extractProperties } from '../../parsers/helpers/extract-properties';
import { MediaTagAttributes } from './types';
import { attributeList } from '../../common/attribute-list';
import { QuotedString } from '../../hls.types';
import { quotedStringify } from '../../../helpers/quoted-stringify';
import { yesnoify } from '../../../helpers/yesnoify';

export default function (str: string): MediaTagAttributes {
    const values: MediaTagAttributes = attributeList<MediaTagAttributes>(str);
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
        TYPE: extractedProperties['TYPE'] as MediaTagAttributes['TYPE'],
        URI: extractedProperties['URI'],
        'GROUP-ID': quotedStringify(extractedProperties['GROUP-ID']),
        LANGUAGE: quotedStringify(extractedProperties['LANGUAGE']),
        'ASSOC-LANGUAGE': quotedStringify(extractedProperties['ASSOC-LANGUAGE']),
        NAME: quotedStringify(extractedProperties['NAME']),
        DEFAULT: extractedProperties['DEFAULT'] as MediaTagAttributes['DEFAULT'],
        AUTOSELECT: extractedProperties['AUTOSELECT'] as MediaTagAttributes['AUTOSELECT'],
        FORCED: extractedProperties['FORCED'] as MediaTagAttributes['FORCED'],
        'INSTREAM-ID': extractedProperties['INSTREAM-ID'] as MediaTagAttributes['INSTREAM-ID'],
        CHARACTERISTICS: extractedProperties['CHARACTERISTICS']?.split(',').map(quotedStringify),
        CHANNELS: quotedStringify(extractedProperties['CHANNELS']),
    };
}
