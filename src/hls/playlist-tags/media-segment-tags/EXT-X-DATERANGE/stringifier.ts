import { EXT_X_DATERANGE_PARSED, EXT_X_DATERANGE_STRING } from './types';

/**
 * Stringifier for EXT-X-DATERANGE tag
 * 
 * RFC 8216 Section 4.3.2.7:
 * - The EXT-X-DATERANGE tag associates a Date Range with a set of
 *   attributes and their associated value semantics.
 * - Its format is: #EXT-X-DATERANGE:<attribute-list>
 */
export function extXDateRangeStringifier(val: EXT_X_DATERANGE_PARSED): EXT_X_DATERANGE_STRING {
    const attrs: string[] = [];

    // Helper function to format values correctly
    const formatValue = (key: string, value: any): string => {
        if (value === undefined || value === null) {
            return '';
        }

        if (typeof value === 'number') {
            return `${key}=${value}`;
        }

        if (typeof value === 'string') {
            // Only END-ON-NEXT and SCTE35 attributes should not be quoted
            if (key === 'END-ON-NEXT' || key.startsWith('SCTE35-')) {
                return `${key}=${value}`;
            }
            // Check if the value is already quoted
            if (value.startsWith('"') && value.endsWith('"')) {
                return `${key}=${value}`;
            }
            return `${key}="${value}"`;
        }

        if (value instanceof Date) {
            return `${key}="${value.toISOString()}"`;
        }

        return `${key}="${value}"`;
    };

    // Required attributes first
    if (val.ID) {
        attrs.push(formatValue('ID', val.ID));
    }
    if (val.CLASS) {
        attrs.push(formatValue('CLASS', val.CLASS));
    }
    if (val['START-DATE']) {
        attrs.push(formatValue('START-DATE', val['START-DATE']));
    }
    if (val['END-DATE']) {
        attrs.push(formatValue('END-DATE', val['END-DATE']));
    }
    if (val.DURATION !== undefined) {
        attrs.push(formatValue('DURATION', val.DURATION));
    }
    if (val['PLANNED-DURATION'] !== undefined) {
        attrs.push(formatValue('PLANNED-DURATION', val['PLANNED-DURATION']));
    }
    if (val['SCTE35-CMD']) {
        attrs.push(formatValue('SCTE35-CMD', val['SCTE35-CMD']));
    }
    if (val['SCTE35-OUT']) {
        attrs.push(formatValue('SCTE35-OUT', val['SCTE35-OUT']));
    }
    if (val['SCTE35-IN']) {
        attrs.push(formatValue('SCTE35-IN', val['SCTE35-IN']));
    }
    if (val['END-ON-NEXT']) {
        attrs.push(formatValue('END-ON-NEXT', val['END-ON-NEXT']));
    }

    // Add X- attributes
    for (const [key, value] of Object.entries(val)) {
        if (key.startsWith('X-')) {
            attrs.push(formatValue(key, value));
        }
    }

    return `#EXT-X-DATERANGE:${attrs.join(',')}`;
} 