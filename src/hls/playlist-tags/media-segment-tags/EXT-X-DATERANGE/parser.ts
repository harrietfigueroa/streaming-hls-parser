import { numberfy } from '../../../../helpers/numberfy';
import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { yesnoify } from '../../../../helpers/yesnoify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { DateRangeAttributes } from './type';

export default function <XValues extends Record<string, string> = Record<string, string>>(
    str: string,
): DateRangeAttributes {
    const values = attributeList<DateRangeAttributes>(str);
    const extractedProperties = extractProperties(values, [
        'ID',
        'CLASS',
        'START-DATE',
        'END-DATE',
        'DURATION',
        'PLANNED-DURATION',
        'SCTE-CMD',
        'SCTE-OUT',
        'SCTE-IN',
        'END-ON-NEXT',
    ]);

    const xValues: XValues = {} as XValues;
    for (const [key, value] of Object.entries(values)) {
        if (key.startsWith('X-')) {
            xValues[key as keyof XValues] = value;
        }
    }

    return {
        ID: quotedStringify(extractedProperties['ID']),
        CLASS: quotedStringify(extractedProperties['CLASS']),
        'START-DATE': extractedProperties['START-DATE'],
        'END-DATE': extractedProperties['END-DATE'],
        DURATION: numberfy(extractedProperties['DURATION']),
        'PLANNED-DURATION': numberfy(extractedProperties['PLANNED-DURATION']),
        'SCTE-CMD': extractedProperties['SCTE-CMD'],
        'SCTE-OUT': extractedProperties['SCTE-OUT'],
        'SCTE-IN': extractedProperties['SCTE-IN'],
        'END-ON-NEXT': extractedProperties['END-ON-NEXT'] as 'YES',
        ...xValues,
    } as DateRangeAttributes;
}
