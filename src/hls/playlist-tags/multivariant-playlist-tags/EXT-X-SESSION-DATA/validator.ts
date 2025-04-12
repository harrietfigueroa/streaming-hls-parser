import { EXT_X_SESSION_DATA_PARSED } from './types';

export default function (input?: EXT_X_SESSION_DATA_PARSED): Error[] {
    if (!input) {
        return [];
    }

    const errors: Error[] = [];

    if (!input['DATA-ID']) {
        errors.push(new Error('DATA-ID is required'));
    }

    if ((input.VALUE && input.URI) || (!input.VALUE && !input.URI)) {
        errors.push(
            new Error(
                'EXT-X-SESSION-DATA tag must contain either a VALUE or URI attribute, but not both.',
            ),
        );
    }

    return errors;
}
