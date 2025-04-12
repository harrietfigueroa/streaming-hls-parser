import { EXT_X_PROGRAM_DATE_TIME_PARSED } from './types';

export default function (value?: EXT_X_PROGRAM_DATE_TIME_PARSED): Error[] {
    if (!value) {
        return [];
    }

    const errors: Error[] = [];

    if (isNaN(value.getTime())) {
        errors.push(new Error('EXT-X-PROGRAM-DATE-TIME must be a valid date'));
    }

    return errors;
}
