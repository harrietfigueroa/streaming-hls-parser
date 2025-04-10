import { EXT_X_ENDLIST_PARSED } from './types';

export default function (str?: string | undefined): EXT_X_ENDLIST_PARSED {
    return typeof str === 'string';
}
