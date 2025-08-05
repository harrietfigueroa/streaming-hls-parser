import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_VERSION_PARSED } from './types';

export function extXVersionParser(str: string): EXT_X_VERSION_PARSED {
    // Return undefined for empty or whitespace strings
    if (!str || str.trim() === '') {
        return undefined;
    }

    // Check if the string starts with the expected tag
    if (!str.startsWith('#EXT-X-VERSION:')) {
        return undefined;
    }

    const value = colonSeparated(str);

    // Return undefined for empty value after colon
    if (!value || value.trim() === '') {
        return undefined;
    }

    const parsed = +value;

    // Return undefined for NaN values
    if (isNaN(parsed)) {
        return undefined;
    }

    // Return undefined for decimal values (EXT-X-VERSION must be an integer)
    if (parsed !== Math.floor(parsed)) {
        return undefined;
    }

    // Return undefined for negative values (EXT-X-VERSION must be positive)
    if (parsed < 0) {
        return undefined;
    }

    return parsed;
} 