import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import extXByteRangeParser from '../../media-segment-tags/EXT-X-BYTERANGE/parser';
import { EXT_X_BYTERANGE_STRING } from '../EXT-X-BYTERANGE/types';
import { EXT_X_MAP_PARSED } from './types';

export default function (str: string): EXT_X_MAP_PARSED {
    const values: EXT_X_MAP_PARSED = attributeList<EXT_X_MAP_PARSED>(str);
    const extractedProperties = extractProperties(values, ['URI', 'BYTERANGE']);
    const byteRange = extractedProperties['BYTERANGE'] as EXT_X_BYTERANGE_STRING | undefined;

    return {
        URI: quotedStringify(extractedProperties['URI']),
        BYTERANGE: typeof byteRange === 'string' ? extXByteRangeParser(byteRange) : undefined,
    };
}
