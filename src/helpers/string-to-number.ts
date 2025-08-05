import { IsDecimalInteger } from './decimal-integer';

/**
 * Helper type to convert string to number if valid
 * Converts a valid decimal integer string to its number literal type
 * Returns never for invalid strings
 */
export type StringToNumber<T extends string> =
    IsDecimalInteger<T> extends true
    ? T extends `${infer N extends number}`
    ? N
    : never
    : never; 