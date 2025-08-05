import { extM3uParser } from './parser';
import { extM3uStringifier } from './stringifier';
import { extM3uValidator, ExtM3uValidationResult } from './validator';
import {
    EXTM3U_PARSED,
    EXTM3U_STRING,
    ExtM3uValidationErrorUnion,
    EXTM3UNotBooleanError
} from './types';

export {
    extM3uParser,
    extM3uStringifier,
    extM3uValidator,
    ExtM3uValidationErrorUnion,
    ExtM3uValidationResult,
    EXTM3UNotBooleanError,
    EXTM3U_PARSED,
    EXTM3U_STRING,
};

export const extM3u = {
    kind: 'Basic' as const,
    parser: extM3uParser,
    stringifier: extM3uStringifier,
    validator: extM3uValidator,
} as const;

export default extM3u; 