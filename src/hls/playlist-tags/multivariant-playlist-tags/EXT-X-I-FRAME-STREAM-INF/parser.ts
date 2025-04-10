import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import streamInfParser from '../EXT-X-STREAM-INF/parser';
import { EXT_I_FRAME_STREAM_PARSED } from './types';

export default function (str: string): EXT_I_FRAME_STREAM_PARSED {
    const sharedProperties = streamInfParser(str);
    const values: EXT_I_FRAME_STREAM_PARSED = attributeList<EXT_I_FRAME_STREAM_PARSED>(str);
    const extractedValues = extractProperties(values, ['URI']);

    return {
        ...sharedProperties,
        URI: extractedValues['URI'],
    };
}
