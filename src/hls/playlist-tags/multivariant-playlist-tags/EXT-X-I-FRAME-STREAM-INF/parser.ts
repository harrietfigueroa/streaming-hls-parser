import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import streamInfParser from '../EXT-X-STREAM-INF/parser';
import { EXT_X_I_FRAME_STREAM_INF_PARSED } from './types';

export default function (str: string): EXT_X_I_FRAME_STREAM_INF_PARSED {
    const sharedProperties = streamInfParser(str);
    const values: EXT_X_I_FRAME_STREAM_INF_PARSED =
        attributeList<EXT_X_I_FRAME_STREAM_INF_PARSED>(str);
    const extractedValues = extractProperties(values, ['URI']);

    return {
        ...sharedProperties,
        URI: extractedValues['URI'],
    };
}
