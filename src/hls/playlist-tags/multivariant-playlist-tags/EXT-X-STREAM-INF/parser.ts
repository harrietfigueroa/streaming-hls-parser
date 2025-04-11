import { numberfy } from '../../../../helpers/numberfy';
import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { yesnoify } from '../../../../helpers/yesnoify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_STREAM_INF_PARSED } from './types';

export default function (str: string): EXT_X_STREAM_INF_PARSED {
    const values: EXT_X_STREAM_INF_PARSED = attributeList<EXT_X_STREAM_INF_PARSED>(str);
    const extractedValues = extractProperties(values, [
        'BANDWIDTH',
        'AVERAGE-BANDWIDTH',
        'CODECS',
        'RESOLUTION',
        'FRAME-RATE',
        'HDCP-LEVEL',
        'AUDIO',
        'VIDEO',
    ]);

    return {
        BANDWIDTH: numberfy(extractedValues['BANDWIDTH']),
        'AVERAGE-BANDWIDTH': numberfy(extractedValues['AVERAGE-BANDWIDTH']),
        RESOLUTION: numberfy(extractedValues['RESOLUTION']),
        'FRAME-RATE': numberfy(extractedValues['FRAME-RATE']),
        CODECS: extractedValues['CODECS']?.split(',').map(quotedStringify),
        'HDCP-LEVEL': extractedValues['HDCP-LEVEL'] as EXT_X_STREAM_INF_PARSED['HDCP-LEVEL'],
        AUDIO: yesnoify(extractedValues['AUDIO'], true),
        VIDEO: yesnoify(extractedValues['VIDEO'], true),
    };
}
