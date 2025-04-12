import { EXT_X_DATERANGE_PARSED } from './type';
export default function (value?: EXT_X_DATERANGE_PARSED): Error[] {
    if (!value) {
        return [];
    }

    const errors: Error[] = [];

    // ID is required
    if (!value.ID) {
        errors.push(new Error('ID is required'));
    }

    // START-DATE is required
    if (!value['START-DATE']) {
        errors.push(new Error('START-DATE is required'));
    }

    // * START-DATE must be a valid date
    if (isNaN(value['START-DATE'].getTime())) {
        errors.push(new Error('START-DATE must be a valid date'));
    }

    // END-DATE is optional but MUST be a valid date if present
    if (value['END-DATE'] && isNaN(value['END-DATE'].getTime())) {
        errors.push(new Error('END-DATE must be a valid date'));
    }

    // PLANNED-DURATION must be positive
    if (value['PLANNED-DURATION'] !== undefined && value['PLANNED-DURATION'] <= 0) {
        errors.push(new Error('PLANNED-DURATION must be positive'));
    }

    // END-ON-NEXT must be YES if present
    if (value['END-ON-NEXT'] && value['END-ON-NEXT'] !== 'YES') {
        errors.push(new Error('END-ON-NEXT must be YES if present'));
    }

    // If END-ON-NEXT is present then CLASS is required
    if (value['END-ON-NEXT'] === 'YES' && !value.CLASS) {
        errors.push(new Error('CLASS is required if END-ON-NEXT is present'));
    }

    // IF END-ON-NEXT is present then DURATION and END-DATE are not allowed
    if (value['END-ON-NEXT'] === 'YES' && (value.DURATION || value['END-DATE'])) {
        errors.push(new Error('DURATION and END-DATE are not allowed if END-ON-NEXT is present'));
    }

    // IF END-DATE and DURATION are present then END-DATE must equal START-DATE + DURATION
    if (value['END-DATE'] && value.DURATION) {
        const startDate = value['START-DATE'];
        const calculatedEndDate = new Date(startDate.getTime() + value.DURATION * 1000);
        const providedEndDate = value['END-DATE'];
        if (calculatedEndDate.getTime() !== providedEndDate.getTime()) {
            errors.push(new Error('END-DATE must equal START-DATE + DURATION'));
        }
    }
    return errors;
}
