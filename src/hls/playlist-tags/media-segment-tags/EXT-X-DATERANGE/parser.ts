import { numberfy } from '../../../../helpers/numberfy';
import { quotedStringify } from '../../../../helpers/quoted-stringify';
import { isDefined } from '../../../../helpers/isDefined';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_DATERANGE_PARSED } from './types';

/**
 * Parser for EXT-X-DATERANGE tag
 * 
 * RFC 8216 Section 4.3.2.7:
 * - The EXT-X-DATERANGE tag associates a Date Range with a set of
 *   attributes and their associated value semantics.
 * - Its format is: #EXT-X-DATERANGE:<attribute-list>
 */
export function extXDateRangeParser<XValues extends Record<string, string> = Record<string, string>>(
    str: string | undefined,
): EXT_X_DATERANGE_PARSED | undefined {
    if (!str) {
        return undefined;
    }

    // Check if it's the correct tag
    if (!str.startsWith('#EXT-X-DATERANGE:')) {
        return undefined;
    }

    const attributesStr = colonSeparated(str);
    if (!attributesStr) {
        return undefined;
    }

    // Parse attributes manually
    const attributes = parseAttributeList(attributesStr);
    if (Object.keys(attributes).length === 0) {
        return undefined;
    }

    // Check for required fields - but be permissive for validator integration
    // Only return undefined if the input is completely malformed
    if (!attributes['ID'] && !attributes['START-DATE']) {
        return undefined;
    }

    // Check that ID and START-DATE are properly quoted if present
    const idValue = attributes['ID'];
    const startDateValue = attributes['START-DATE'];

    if (idValue && (!idValue.startsWith('"') || !idValue.endsWith('"'))) {
        return undefined;
    }

    if (startDateValue && (!startDateValue.startsWith('"') || !startDateValue.endsWith('"'))) {
        return undefined;
    }

    // Validate START-DATE but don't fail parsing for invalid dates
    let startDate: Date | undefined;
    if (attributes['START-DATE']) {
        // Remove quotes for date parsing
        const dateStr = attributes['START-DATE'].slice(1, -1);
        startDate = new Date(dateStr);
        // Don't set to undefined for invalid dates, let validator handle validation
    }

    const result: Partial<EXT_X_DATERANGE_PARSED> = {
        ID: idValue ? idValue.slice(1, -1) : undefined, // Remove quotes
        'START-DATE': startDate,
    };

    // Handle optional attributes
    if (attributes['CLASS']) {
        result.CLASS = attributes['CLASS'].slice(1, -1); // Remove quotes
    }

    if (attributes['END-DATE']) {
        // Remove quotes for date parsing
        const dateStr = attributes['END-DATE'].slice(1, -1);
        const endDate = new Date(dateStr);
        // Don't fail parsing for invalid END-DATE, let validator handle it
        result['END-DATE'] = endDate;
    }

    if (attributes['DURATION']) {
        const duration = numberfy(attributes['DURATION']);
        if (duration !== undefined && duration >= 0) {
            result.DURATION = duration;
        }
    }

    if (attributes['PLANNED-DURATION']) {
        const plannedDuration = numberfy(attributes['PLANNED-DURATION']);
        // Don't fail parsing for invalid PLANNED-DURATION, let validator handle it
        if (plannedDuration !== undefined) {
            result['PLANNED-DURATION'] = plannedDuration;
        }
    }

    if (attributes['SCTE35-CMD']) {
        result['SCTE35-CMD'] = attributes['SCTE35-CMD'].startsWith('"') && attributes['SCTE35-CMD'].endsWith('"')
            ? attributes['SCTE35-CMD'].slice(1, -1)
            : attributes['SCTE35-CMD'];
    }

    if (attributes['SCTE35-OUT']) {
        result['SCTE35-OUT'] = attributes['SCTE35-OUT'].startsWith('"') && attributes['SCTE35-OUT'].endsWith('"')
            ? attributes['SCTE35-OUT'].slice(1, -1)
            : attributes['SCTE35-OUT'];
    }

    if (attributes['SCTE35-IN']) {
        result['SCTE35-IN'] = attributes['SCTE35-IN'].startsWith('"') && attributes['SCTE35-IN'].endsWith('"')
            ? attributes['SCTE35-IN'].slice(1, -1)
            : attributes['SCTE35-IN'];
    }

    if (attributes['END-ON-NEXT']) {
        // Don't fail parsing for invalid END-ON-NEXT, let validator handle it
        result['END-ON-NEXT'] = attributes['END-ON-NEXT'] as any;
    }

    // Add X- attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith('X-')) {
            // Don't convert hexadecimal values to numbers
            if (value.startsWith('0x') || value.startsWith('0X')) {
                (result as any)[key] = value;
            } else {
                // Convert X- attributes to numbers if they look like numbers, otherwise keep as strings
                const numericValue = numberfy(value);
                if (numericValue !== undefined && !isNaN(numericValue)) {
                    (result as any)[key] = numericValue;
                } else {
                    // Remove quotes if present
                    const cleanValue = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
                    (result as any)[key] = cleanValue;
                }
            }
        }
    }

    return result as EXT_X_DATERANGE_PARSED;
}

/**
 * Parse attribute list with proper handling of quoted strings
 */
function parseAttributeList(attributes: string): Record<string, string> {
    const result: Record<string, string> = {};
    let current = 0;

    while (current < attributes.length) {
        // Skip whitespace
        while (current < attributes.length && attributes[current] === ' ') {
            current++;
        }

        if (current >= attributes.length) break;

        // Find the key (until =)
        const keyStart = current;
        while (current < attributes.length && attributes[current] !== '=') {
            current++;
        }

        if (current >= attributes.length) break;

        const key = attributes.slice(keyStart, current);
        current++; // Skip =

        // Find the value
        let value: string;
        if (current < attributes.length && attributes[current] === '"') {
            // Quoted string - include the quotes
            const valueStart = current;
            current++; // Skip opening quote
            while (current < attributes.length && attributes[current] !== '"') {
                current++;
            }
            if (current < attributes.length) {
                current++; // Skip closing quote
            }
            value = attributes.slice(valueStart, current);
        } else {
            // Unquoted value (until comma or end)
            const valueStart = current;
            while (current < attributes.length && attributes[current] !== ',') {
                current++;
            }
            value = attributes.slice(valueStart, current);
        }

        result[key] = value;

        // Skip comma
        if (current < attributes.length && attributes[current] === ',') {
            current++;
        }
    }

    return result;
} 