import { EXT_X_MAP_PARSED } from './types';

export default function (value?: EXT_X_MAP_PARSED): Error[] {
    if (!value) {
        return [];
    }

    const errors: Error[] = [];
    // URI is required
    if (!value.URI) {
        errors.push(new Error('URI is required'));
    }
    return errors;
}
