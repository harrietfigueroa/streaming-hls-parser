import { attributeList } from '../../common/attribute-list';
import { extractProperties } from '../../parsers/helpers/extract-properties';
import streamInfParser from '../EXT-X-STREAM-INF/parser';
import { IFrameStreamInfAttributes } from './types';

export default function (str: string): IFrameStreamInfAttributes {
    const sharedProperties = streamInfParser(str);
    const values: IFrameStreamInfAttributes = attributeList<IFrameStreamInfAttributes>(str);
    const extractedValues = extractProperties(values, ['URI']);

    return {
        ...sharedProperties,
        URI: extractedValues['URI'],
    };
}
