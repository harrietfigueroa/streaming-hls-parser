import { isPresent } from '../../common/tag-present';

export function endlistParse(str: string): boolean {
    return isPresent(str);
}
