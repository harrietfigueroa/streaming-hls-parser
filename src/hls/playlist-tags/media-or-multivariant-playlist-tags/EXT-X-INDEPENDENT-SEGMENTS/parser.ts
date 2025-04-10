import { EXT_X_INDEPENDENT_SEGMENTS_PARSED } from './types';

export default function (str: string | undefined): EXT_X_INDEPENDENT_SEGMENTS_PARSED {
    return typeof str === 'string';
}
