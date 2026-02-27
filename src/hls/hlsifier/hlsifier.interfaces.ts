/**
 * Value-level replacer that transforms property values during serialization,
 * similar to JSON.stringify's replacer parameter.
 *
 * @param key - The property key being serialized (e.g., '#EXT-X-VERSION', 'BANDWIDTH')
 * @param value - The property value
 * @returns The transformed value, or undefined to omit the property
 */
export type ValueReplacer = (key: string, value: any) => any;

/**
 * String-level replacer that transforms each output line after serialization.
 *
 * @param line - A single line of HLS output
 * @returns The transformed line
 */
export type StringReplacer = (line: string) => string;

/**
 * Replacer function for transforming HLS output during serialization.
 * Can operate at the value level (before encoding) or string level (after encoding).
 */
export type Replacer = ValueReplacer | StringReplacer;

/**
 * Type guard to check if a replacer is a ValueReplacer.
 * ValueReplacers accept 2 parameters (key, value), while StringReplacers accept 1 (line).
 */
export function isValueReplacer(replacer: Replacer): replacer is ValueReplacer {
    return replacer.length === 2;
}

/**
 * Type guard to check if a replacer is a StringReplacer.
 * StringReplacers accept 1 parameter (line), while ValueReplacers accept 2 (key, value).
 */
export function isStringReplacer(replacer: Replacer): replacer is StringReplacer {
    return replacer.length === 1;
}

/**
 * Options for controlling HLS output formatting.
 * Similar to JSON.stringify's space parameter, but adapted for HLS-specific needs.
 */
export interface FormatOptions {
    /**
     * Line ending style to use in the output.
     * @default '\n'
     */
    lineEndings?: '\n' | '\r\n';

    /**
     * Whether to include RFC 8216 comments explaining each tag.
     * Useful for debugging and documentation.
     * @default false
     */
    includeComments?: boolean;

    /**
     * Enable pretty-printing with additional whitespace for readability.
     * Note: HLS spec requires specific formatting, so this is limited.
     * @default false
     */
    prettyPrint?: boolean;
}
