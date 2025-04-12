export default function (tag: Record<string, string>): Error[] {
    const errors: Error[] = [];

    // Validate EXT-X-MEDIA tag

    // TYPE MUST be defined
    if (!tag.TYPE) {
        errors.push(new Error('TYPE is required'));
    }

    // If TYPE is CLOSED-CAPTIONS then URI MUST NOT be present
    if (tag.TYPE === 'CLOSED-CAPTIONS' && tag.URI) {
        errors.push(new Error('URI must not be present when TYPE is CLOSED-CAPTIONS'));
    }

    // GROUP-ID is REQUIRED
    if (!tag['GROUP-ID']) {
        errors.push(new Error('GROUP-ID is required'));
    }

    // NAME is REQUIRED
    if (!tag.NAME) {
        errors.push(new Error('NAME is required'));
    }

    // AUTO-SELECT must be YES if DEFAULT is YES
    if (tag.DEFAULT === 'YES' && tag['AUTO-SELECT'] !== 'YES') {
        errors.push(new Error('AUTO-SELECT must be YES if DEFAULT is YES'));
    }

    // * FORCED MUST NOT be present unless TYPE is SUBTITLES
    if (tag.FORCED && tag.TYPE !== 'SUBTITLES') {
        errors.push(new Error('FORCED must not be present unless TYPE is SUBTITLES'));
    }

    // INSTREAM-ID is REQUIRED if the TYPE attribute is CLOSED-CAPTIONS
    if (tag.TYPE === 'CLOSED-CAPTIONS' && !tag['INSTREAM-ID']) {
        errors.push(new Error('INSTREAM-ID is required when TYPE is CLOSED-CAPTIONS'));
    }

    // INSTREAM-ID MUST have one of the values: "CC1", "CC2", "CC3", "CC4", or "SERVICEn"
    if (tag.TYPE === 'CLOSED-CAPTIONS' && tag['INSTREAM-ID']) {
        const validInstreamIds = ['CC1', 'CC2', 'CC3', 'CC4'];
        const isServiceN = /^SERVICE\d+$/.test(tag['INSTREAM-ID']);
        if (!validInstreamIds.includes(tag['INSTREAM-ID']) && !isServiceN) {
            errors.push(
                new Error(
                    'INSTREAM-ID must be one of "CC1", "CC2", "CC3", "CC4", or "SERVICEn" where n is an integer between 1 and 63',
                ),
            );
        }
    }

    // For all other TYPE values, the INSTREAM-ID MUST NOT be specified
    if (tag.TYPE !== 'CLOSED-CAPTIONS' && tag['INSTREAM-ID']) {
        errors.push(new Error('INSTREAM-ID must not be specified unless TYPE is CLOSED-CAPTIONS'));
    }

    return errors;
}
