import { numberfy } from '../../../../helpers/numberfy';
import { yesnoify } from '../../../../helpers/yesnoify';
import { attributeList } from '../../../parse-helpers/attribute-list';
import { extractProperties } from '../../../parse-helpers/extract-properties';
import { EXT_X_START_PARSED, PreciseValue } from './types';

// Helper type to extract TIME-OFFSET from string
type ExtractTimeOffset<T extends string> =
    T extends `#EXT-X-START:TIME-OFFSET=${infer TimeOffset},PRECISE=${infer Precise}`
    ? TimeOffset extends `${infer Number}`
    ? Number extends `${number}`
    ? Number
    : never
    : never
    : T extends `#EXT-X-START:TIME-OFFSET=${infer TimeOffset}`
    ? TimeOffset extends `${infer Number}`
    ? Number extends `${number}`
    ? Number
    : never
    : never
    : never;

// Helper type to extract PRECISE from string
type ExtractPrecise<T extends string> =
    T extends `#EXT-X-START:TIME-OFFSET=${infer TimeOffset},PRECISE=${infer Precise}`
    ? Precise extends 'YES' | 'NO'
    ? Precise
    : undefined
    : undefined;

// Main parser type that returns the appropriate type based on input
type ExtXStartParser<T extends string> =
    T extends `#EXT-X-START:${string}`
    ? {
        'TIME-OFFSET': ExtractTimeOffset<T> extends never ? number : ExtractTimeOffset<T>;
        PRECISE?: ExtractPrecise<T>;
    }
    : EXT_X_START_PARSED | undefined;

export function extXStartParser<T extends string>(str: T): ExtXStartParser<T> {
    // Return undefined for empty or whitespace strings
    if (!str || str.trim() === '') {
        return undefined as ExtXStartParser<T>;
    }

    // Check if the string starts with the expected tag
    if (!str.startsWith('#EXT-X-START:')) {
        return undefined as ExtXStartParser<T>;
    }

    const values = attributeList<EXT_X_START_PARSED>(str);
    const extractedProperties = extractProperties(values, ['TIME-OFFSET', 'PRECISE']);

    const timeOffset = numberfy(extractedProperties['TIME-OFFSET']);
    const preciseRaw = yesnoify(extractedProperties['PRECISE'], false);
    const precise = preciseRaw ? preciseRaw.trim() as PreciseValue : undefined;

    // Return undefined if TIME-OFFSET is NaN
    if (isNaN(timeOffset)) {
        return undefined as ExtXStartParser<T>;
    }

    return {
        'TIME-OFFSET': timeOffset,
        PRECISE: precise,
    } as ExtXStartParser<T>;
}
