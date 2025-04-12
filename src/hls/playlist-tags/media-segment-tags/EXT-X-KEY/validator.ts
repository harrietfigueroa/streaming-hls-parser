import { EXT_X_KEY_PARSED } from './types';

export default function (value?: EXT_X_KEY_PARSED): Error[] {
    if (!value) {
        return [];
    }

    const errors: Error[] = [];

    // METHOD is required
    if (!value.METHOD) {
        errors.push(new Error('METHOD is required'));
    }

    // IF ENCRYPTION is NONE, other attributes MUST NOT be present
    if (value.METHOD === 'NONE') {
        const disallowedAttributes = [
            'URI',
            'IV',
            'KEYFORMAT',
            'KEYFORMATVERSIONS',
        ] satisfies (keyof EXT_X_KEY_PARSED)[];
        for (const attr of disallowedAttributes) {
            if (value[attr as keyof EXT_X_KEY_PARSED] !== undefined) {
                errors.push(new Error(`${attr} must not be present when METHOD is NONE`));
            }
        }
    }

    // URI is required if METHOD is not NONE
    if (value.METHOD !== 'NONE' && !value.URI) {
        errors.push(new Error('URI is required if METHOD is not NONE'));
    }

    return errors;
}
