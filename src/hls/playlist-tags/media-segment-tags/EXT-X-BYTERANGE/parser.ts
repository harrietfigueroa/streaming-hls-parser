import { numberfy } from '../../../../helpers/numberfy';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXT_X_BYTERANGE_PARSED, EXT_X_BYTERANGE_STRING } from './types';

export function extXByteRangeParser<T extends EXT_X_BYTERANGE_STRING>(str: T): EXT_X_BYTERANGE_PARSED<T> | undefined {
    if (!str?.startsWith('#EXT-X-BYTERANGE:')) {
        return undefined;
    }

    try {
        const attrs = colonSeparated(str);
        const parts = attrs.split('@');

        if (parts.length === 0 || parts.length > 2) {
            return undefined;
        }

        const LENGTH = numberfy(parts[0]);
        const OFFSET = parts.length > 1 ? numberfy(parts[1]) : undefined;

        // Validate that LENGTH is a valid number
        if (LENGTH === undefined || isNaN(LENGTH) || LENGTH < 0) {
            return undefined;
        }

        // Validate OFFSET if present
        if (OFFSET !== undefined && (isNaN(OFFSET) || OFFSET < 0)) {
            return undefined;
        }

        return { LENGTH, OFFSET };
    } catch {
        return undefined;
    }
} 