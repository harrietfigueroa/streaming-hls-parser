/**
 * RFC 8216 Attribute List Specification:
 * An attribute-list is a comma-separated list of attribute/value pairs with no whitespace.
 * Syntax: AttributeName=AttributeValue
 * AttributeName: unquoted string containing characters from [A..Z], [0..9] and '-'
 * AttributeValue: string (all values treated as strings in this implementation)
 */

// Base type for a single key-value pair
type AttributePair<T extends string> = `${T}=${string}`;

// Variadic tuple type that represents an attribute list as a template literal
type AttributeListTuple<T extends readonly string[]> = T extends readonly [
    infer First,
    ...infer Rest,
]
    ? Rest extends readonly string[]
        ? Rest['length'] extends 0
            ? AttributePair<First & string>
            : `${AttributePair<First & string>},${AttributeListTuple<Rest>}`
        : never
    : '';

// export function fromAttributeList<T extends unknown>(string: string): T {
//     const result = Object.fromEntries(
//         string
//             .split(',')
//             .map((pair) => pair.split('='))
//             .map(([key, value]) => [key, value.replace(/^"|"$/g, '')]),
//     );
//     return result as T;
// }
export function fromAttributeList(attributeListString: string): Record<string, string> {
    const result: Record<string, string> = {};
    let currentKey = '';
    let currentValue = '';
    let inQuotes = false;
    let i = 0;
    let parsingValue = false;

    while (i < attributeListString.length) {
        const char = attributeListString[i];

        if (char === '"' && (i === 0 || attributeListString[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
            if (parsingValue) {
                currentValue += char;
            }
        } else if (char === '=' && !inQuotes && !parsingValue) {
            // Found the equals sign, we're now parsing the value
            parsingValue = true;
        } else if (char === ',' && !inQuotes) {
            // Found a comma outside quotes, this is the end of a key-value pair
            if (currentKey && currentValue !== undefined) {
                // Remove surrounding quotes from value if present
                const cleanValue =
                    currentValue.startsWith('"') && currentValue.endsWith('"')
                        ? currentValue.slice(1, -1)
                        : currentValue;
                result[currentKey] = cleanValue;
            }
            currentKey = '';
            currentValue = '';
            parsingValue = false;
        } else if (parsingValue) {
            // We're parsing the value
            currentValue += char;
        } else {
            // We're still parsing the key
            currentKey += char;
        }
        i++;
    }

    // Don't forget the last key-value pair
    if (currentKey && currentValue !== undefined) {
        const cleanValue =
            currentValue.startsWith('"') && currentValue.endsWith('"')
                ? currentValue.slice(1, -1)
                : currentValue;
        result[currentKey] = cleanValue;
    }

    return result;
}

export function toAttributeList<T extends Record<string, unknown>>(
    obj: T,
): AttributeListTuple<string[]> {
    return Object.entries(obj)
        .map(([key, value]) => `${key}=${value}`)
        .join(',') as AttributeListTuple<string[]>;
}
