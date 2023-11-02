import { isPresent } from '../../common/tag-present';

export function iFramesOnly(str: string): boolean {
    return isPresent(str);
}
