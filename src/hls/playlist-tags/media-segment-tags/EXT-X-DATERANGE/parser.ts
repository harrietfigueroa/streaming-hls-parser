import { numberfy } from '../../../../helpers/numberfy';
import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_DATERANGE_PARSED } from './type';

export default function <XValues extends Record<string, string> = Record<string, string>>(
    str: string,
): EXT_X_DATERANGE_PARSED {
    const values = attributeList<EXT_X_DATERANGE_PARSED>(str);
    const extractedProperties = extractProperties(values, [
        'ID',
        'CLASS',
        'START-DATE',
        'END-DATE',
        'DURATION',
        'PLANNED-DURATION',
        'SCTE35-CMD',
        'SCTE35-OUT',
        'SCTE35-IN',
        'END-ON-NEXT',
    ]);

    const xValues: XValues = {} as XValues;
    for (const [key, value] of Object.entries(values)) {
        if (key.startsWith('X-')) {
            xValues[key as keyof XValues] = value;
        }
    }

    const END_DATE = extractedProperties['END-DATE']
        ? new Date(extractedProperties['END-DATE'])
        : undefined;
    return {
        ID: quotedStringify(extractedProperties['ID']),
        CLASS: quotedStringify(extractedProperties['CLASS']),
        'START-DATE': new Date(extractedProperties['START-DATE']),
        'END-DATE': END_DATE,
        DURATION: numberfy(extractedProperties['DURATION']),
        'PLANNED-DURATION': numberfy(extractedProperties['PLANNED-DURATION']),
        'SCTE35-CMD': extractedProperties['SCTE35-CMD'],
        'SCTE35-OUT': extractedProperties['SCTE35-OUT'],
        'SCTE35-IN': extractedProperties['SCTE35-IN'],
        'END-ON-NEXT': extractedProperties['END-ON-NEXT'] as 'YES',
        ...xValues,
    } as EXT_X_DATERANGE_PARSED;
}
