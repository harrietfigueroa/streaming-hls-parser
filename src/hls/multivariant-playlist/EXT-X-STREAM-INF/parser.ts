import { numberfy } from '../../../helpers/numberfy';
import { quotedStringify } from '../../../helpers/quoted-stringify';
import { yesnoify } from '../../../helpers/yesnoify';
import { attributeList } from '../../common/attribute-list';
import { extractProperties } from '../../parsers/helpers/extract-properties';
import { StreamInfAttributes } from './types';

export default function (str: string): StreamInfAttributes {
    const values: StreamInfAttributes = attributeList<StreamInfAttributes>(str);
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
        CODECS: extractedValues['CODECS'].split(',').map(quotedStringify),
        'HDCP-LEVEL': extractedValues['HDCP-LEVEL'] as StreamInfAttributes['HDCP-LEVEL'],
        AUDIO: yesnoify(extractedValues['AUDIO']),
        VIDEO: yesnoify(extractedValues['VIDEO']),
    };
}
