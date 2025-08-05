import { describe, expect, it } from 'vitest';
import { extXPlaylistTypeValidator } from './validator';

describe('EXT-X-PLAYLIST-TYPE validator', () => {
    it('should validate EVENT value', () => {
        const result = extXPlaylistTypeValidator.validate('EVENT');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-PLAYLIST-TYPE');
    });

    it('should validate VOD value', () => {
        const result = extXPlaylistTypeValidator.validate('VOD');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should validate undefined value (optional tag)', () => {
        const result = extXPlaylistTypeValidator.validate(undefined);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid enum values', () => {
        const result = extXPlaylistTypeValidator.validate('LIVE' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PLAYLIST-TYPE value must be one of: EVENT, VOD (RFC 8216 Section 4.3.3.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5)');
        expect(result.errors[0].invalidValue).toBe('LIVE');
    });

    it('should reject non-string and non-undefined values', () => {
        const result = extXPlaylistTypeValidator.validate(123 as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PLAYLIST-TYPE value must be a string or undefined (RFC 8216 Section 4.3.3.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5)');
        expect(result.errors[0].invalidValue).toBe(123);
    });

    it('should reject case-sensitive invalid values', () => {
        const result = extXPlaylistTypeValidator.validate('event' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PLAYLIST-TYPE value must be one of: EVENT, VOD (RFC 8216 Section 4.3.3.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5)');
        expect(result.errors[0].invalidValue).toBe('event');
    });

    it('should reject empty string', () => {
        const result = extXPlaylistTypeValidator.validate('' as any);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].description).toBe('EXT-X-PLAYLIST-TYPE value must be one of: EVENT, VOD (RFC 8216 Section 4.3.3.5: https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5)');
        expect(result.errors[0].invalidValue).toBe('');
    });
}); 