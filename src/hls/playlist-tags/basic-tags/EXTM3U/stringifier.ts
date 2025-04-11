import { EXTM3U_STRING } from './types';

export default function () {
    return '#EXTM3U' as const satisfies EXTM3U_STRING;
}
