import { EXT_X_I_FRAMES_ONLY_STRING } from './types';

export default function () {
    return '#EXT-X-I-FRAMES-ONLY' as const satisfies EXT_X_I_FRAMES_ONLY_STRING;
}
