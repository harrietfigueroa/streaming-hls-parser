import { EXT_X_START_PARSED, EXT_X_START_STRING, PreciseValue } from './types';

export function extXStartStringifier<timeOffset extends number, precise extends PreciseValue | undefined = undefined>(
    value: EXT_X_START_PARSED<timeOffset, precise>
): EXT_X_START_STRING<timeOffset, precise> {
    const TIME_OFFSET = value['TIME-OFFSET'];
    const PRECISE = value['PRECISE'];

    if (PRECISE) {
        return `#EXT-X-START:TIME-OFFSET=${TIME_OFFSET},PRECISE=${PRECISE}` as EXT_X_START_STRING<timeOffset, precise>;
    } else {
        return `#EXT-X-START:TIME-OFFSET=${TIME_OFFSET}` as EXT_X_START_STRING<timeOffset, precise>;
    }
}
