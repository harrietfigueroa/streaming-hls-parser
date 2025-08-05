/**
 * Helper function to stringify Date objects to ISO 8601 format
 * 
 * Converts Date objects to ISO 8601 format as specified in RFC 8216:
 * - YYYY-MM-DDThh:mm:ss.SSSZ (with timezone)
 * - Includes milliseconds and timezone information
 * 
 * @param date - Date object to stringify
 * @returns ISO 8601 formatted date string, undefined if invalid
 */
export function dateStringify(date: Date | undefined): string | undefined {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return undefined;
    }

    // Convert to ISO string format (YYYY-MM-DDTHH:mm:ss.sssZ)
    return date.toISOString();
}

/**
 * Helper function to stringify Date objects to ISO 8601 format with custom precision
 * 
 * @param date - Date object to stringify
 * @param includeMilliseconds - Whether to include milliseconds (default: true)
 * @returns ISO 8601 formatted date string, undefined if invalid
 */
export function dateStringifyWithPrecision(
    date: Date | undefined,
    includeMilliseconds: boolean = true
): string | undefined {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return undefined;
    }

    if (includeMilliseconds) {
        return date.toISOString();
    } else {
        // Format without milliseconds: YYYY-MM-DDTHH:mm:ssZ
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    }
} 