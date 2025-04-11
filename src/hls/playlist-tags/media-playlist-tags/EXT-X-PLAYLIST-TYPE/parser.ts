import { colonSeparated } from '../../../parse-helpers/colon-separated';
import { PlaylistTypes, PlaylistTypeValues } from './types';

export default function (str: string | PlaylistTypeValues): PlaylistTypeValues | null {
    const eventType = colonSeparated(str);
    if (eventType === PlaylistTypes.EVENT) return PlaylistTypes.EVENT;
    if (eventType === PlaylistTypes.VOD) return PlaylistTypes.VOD;
    return null;
}
