import { numberfy } from '../../../../helpers/numberfy';
import { yesnoify } from '../../../../helpers/yesnoify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_START_PARSED } from './types';

export default function (str: string): EXT_X_START_PARSED {
    const values = attributeList<EXT_X_START_PARSED>(str);
    const extractedProperties = extractProperties(values, ['TIME-OFFSET', 'PRECISE']);

    return {
        'TIME-OFFSET': numberfy(extractedProperties['TIME-OFFSET']),
        PRECISE: yesnoify(extractedProperties['PRECISE'], false),
    };
}
