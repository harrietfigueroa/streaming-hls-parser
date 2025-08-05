import { describe, it, expect } from 'vitest';
import { extXDiscontinuityParser } from './parser';
import { extXDiscontinuityValidator } from './validator';
import { EXTXDISCONTINUITYNotABooleanError } from './types';

describe('EXT-X-DISCONTINUITY parser-validator integration', () => {
    it('should validate parsed boolean true', () => {
        const parsed = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        const validation = extXDiscontinuityValidator.validate(parsed);

        expect(parsed).toBe(true);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        expect(validation.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should validate parsed boolean from undefined input', () => {
        const parsed = extXDiscontinuityParser(undefined);
        const validation = extXDiscontinuityValidator.validate(parsed);

        expect(parsed).toBe(true);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        expect(validation.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should validate parsed boolean from empty string', () => {
        const parsed = extXDiscontinuityParser('');
        const validation = extXDiscontinuityValidator.validate(parsed);

        expect(parsed).toBe(true);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        expect(validation.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should always validate as true for any parsed values (boolean tags are always valid)', () => {
        // Simulate an invalid parsed value (this shouldn't happen with the current parser)
        const invalidParsed = 'not a boolean' as any;
        const validation = extXDiscontinuityValidator.validate(invalidParsed);

        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        expect(validation.tagName).toBe('#EXT-X-DISCONTINUITY');
    });

    it('should maintain type safety through parser-validator chain', () => {
        const parsed = extXDiscontinuityParser('#EXT-X-DISCONTINUITY');
        const validation = extXDiscontinuityValidator.validate(parsed);

        // Type assertions to ensure type safety
        const _testParsed: boolean = parsed;
        const _testValidation = validation;

        expect(typeof parsed).toBe('boolean');
        expect(validation.tagName).toBe('#EXT-X-DISCONTINUITY');
    });
}); 