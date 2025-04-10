import { PlaylistTypes, PlaylistTypeValues } from './types';

export default function (str: string | PlaylistTypeValues): PlaylistTypeValues | null {
    if (str === PlaylistTypes.EVENT) return PlaylistTypes.EVENT;
    if (str === PlaylistTypes.VOD) return PlaylistTypes.VOD;
    return null;
}
