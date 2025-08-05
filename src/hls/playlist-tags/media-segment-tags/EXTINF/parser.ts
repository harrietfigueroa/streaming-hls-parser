import { numberfy } from '../../../../helpers/numberfy';
import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { EXTINF_PARSED } from './types';

export function extinfParser(str: string): EXTINF_PARSED | undefined {
    try {
        const strValue = colonSeparated(str);
        const commaIndex = strValue.indexOf(',');

        if (commaIndex === -1) {
            return undefined;
        }

        const durationStr = strValue.slice(0, commaIndex);
        const titleStr = strValue.slice(commaIndex + 1);

        const duration = numberfy(durationStr);
        if (isNaN(duration)) {
            return undefined;
        }

        return {
            DURATION: duration,
            TITLE: titleStr || undefined,
            _originalDuration: durationStr,
        };
    } catch {
        return undefined;
    }
} 