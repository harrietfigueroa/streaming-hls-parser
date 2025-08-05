import { EXTM3U_STRING } from './types';

export function extM3uStringifier(): EXTM3U_STRING {
    return '#EXTM3U' as const;
} 