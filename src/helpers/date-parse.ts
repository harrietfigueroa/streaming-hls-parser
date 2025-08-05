/**
 * Helper function to parse ISO 8601 date strings to Date objects
 * 
 * Supports the following ISO 8601 formats as specified in RFC 8216:
 * - YYYY-MM-DDThh:mm:ss.SSSZ (with timezone)
 * - YYYY-MM-DDThh:mm:ss.SSS+/-hh:mm (with timezone offset)
 * - YYYY-MM-DDThh:mm:ssZ (UTC)
 * - YYYY-MM-DDThh:mm:ss+/-hh:mm (with timezone offset)
 * - YYYY-MM-DDThh:mm:ss (local time)
 * 
 * @param dateString - ISO 8601 formatted date string
 * @returns Date object if valid, undefined if invalid
 */
export function dateParse(dateString: string | undefined): Date | undefined {
    if (!dateString || typeof dateString !== 'string') {
        return undefined;
    }

    // Try to parse the date string
    const date = new Date(dateString);

    // Check if the date is valid (not NaN)
    if (isNaN(date.getTime())) {
        return undefined;
    }

    return date;
} 