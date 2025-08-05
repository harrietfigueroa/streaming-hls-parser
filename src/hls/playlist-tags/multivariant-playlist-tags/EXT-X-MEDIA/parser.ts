import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_MEDIA_PARSED, EXT_X_MEDIA_STRING } from './types';

// Generic parser type for type inference
type ExtXMediaParser<T extends string> = T extends EXT_X_MEDIA_STRING ? EXT_X_MEDIA_PARSED : never;

export function extXMediaParser<T extends string>(str: T): ExtXMediaParser<T> {
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

    // Simple extraction - no validation
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
        CHARACTERISTICS: quotedStringify(extractedProperties['CHARACTERISTICS']),
        CHANNELS: quotedStringify(extractedProperties['CHANNELS']),
    } as ExtXMediaParser<T>;
}

export default extXMediaParser;
