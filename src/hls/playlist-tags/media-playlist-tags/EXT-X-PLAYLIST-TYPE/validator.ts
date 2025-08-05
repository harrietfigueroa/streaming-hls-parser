import { Validator, ValidationResult } from '../../../validation-helpers/validator.types';
import {
    EXT_X_PLAYLIST_TYPE_PARSED,
    ExtXPlaylistTypeValidationErrorUnion,
    EXTXPLAYLISTTYPENotStringOrNullError,
    EXTXPLAYLISTTYPEInvalidEnumValueError,
    PlaylistTypes
} from './types';

export interface ExtXPlaylistTypeValidationResult extends ValidationResult<ExtXPlaylistTypeValidationErrorUnion> {
    tagName: '#EXT-X-PLAYLIST-TYPE';
}

/**
 * Validates EXT-X-PLAYLIST-TYPE values according to RFC 8216
 * 
 * RFC 8216 Section 4.3.3.5:
 * - type-enum is either EVENT or VOD
 * - It is OPTIONAL
 * - If the EXT-X-PLAYLIST-TYPE value is EVENT, Media Segments can only be added to the end of the Media Playlist
 * - If the EXT-X-PLAYLIST-TYPE value is Video On Demand (VOD), the Media Playlist cannot change
 */
export class ExtXPlaylistTypeValidator implements Validator<EXT_X_PLAYLIST_TYPE_PARSED, ExtXPlaylistTypeValidationErrorUnion> {
    validate(value: EXT_X_PLAYLIST_TYPE_PARSED): ExtXPlaylistTypeValidationResult {
        const errors: ExtXPlaylistTypeValidationErrorUnion[] = [];

        // Check if value is a string or undefined (undefined indicates tag is not present, which is valid)
        if (value !== undefined && typeof value !== 'string') {
            errors.push(new EXTXPLAYLISTTYPENotStringOrNullError(value));
        }

        // If value is undefined, it's valid (tag is optional)
        if (value === undefined) {
            return {
                tagName: '#EXT-X-PLAYLIST-TYPE',
                errors,
                isValid: true
            };
        }

        // Check if value is one of the allowed enum values (only if it's a string)
        if (typeof value === 'string') {
            const validValues = Object.values(PlaylistTypes);
            if (!validValues.includes(value)) {
                errors.push(new EXTXPLAYLISTTYPEInvalidEnumValueError(value));
            }
        }

        return {
            tagName: '#EXT-X-PLAYLIST-TYPE',
            errors,
            isValid: errors.length === 0
        };
    }
}

export const extXPlaylistTypeValidator = new ExtXPlaylistTypeValidator(); 