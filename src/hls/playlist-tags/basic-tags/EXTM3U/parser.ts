import { EXTM3U_PARSED } from './types';

export default function (str: string | undefined): EXTM3U_PARSED {
    return typeof str === 'string';
}
