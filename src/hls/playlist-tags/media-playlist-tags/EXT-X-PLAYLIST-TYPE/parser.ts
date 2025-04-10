import { PlaylistTypeEnum } from './types';

export default function (str: string | PlaylistTypeEnum): PlaylistTypeEnum | null {
    if (str === PlaylistTypeEnum.EVENT) return PlaylistTypeEnum.EVENT;
    if (str === PlaylistTypeEnum.VOD) return PlaylistTypeEnum.VOD;
    return null;
}
