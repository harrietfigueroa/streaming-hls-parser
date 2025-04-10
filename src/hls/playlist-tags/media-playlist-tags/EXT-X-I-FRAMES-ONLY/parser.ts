import { EXT_X_I_FRAMES_ONLY_PARSED } from './types';

export default function (str?: string | undefined): EXT_X_I_FRAMES_ONLY_PARSED {
    return typeof str === 'string';
}
