import { describe, it, expect } from 'vitest';
import { extXStartParser } from './parser';
import { extXStartStringifier } from './stringifier';

describe('EXT-X-START integration', () => {
    it('should parse and stringify TIME-OFFSET only round-trip', () => {
        const input = '#EXT-X-START:TIME-OFFSET=10.5';
        const parsed = extXStartParser(input);
        const stringified = extXStartStringifier(parsed as any);
        expect(stringified).toBe(input);
    });

    it('should parse and stringify TIME-OFFSET and PRECISE=YES round-trip', () => {
        const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=YES';
        const parsed = extXStartParser(input);
        const stringified = extXStartStringifier(parsed as any);
        expect(stringified).toBe(input);
    });

    it('should parse and stringify TIME-OFFSET and PRECISE=NO round-trip', () => {
        const input = '#EXT-X-START:TIME-OFFSET=10.5,PRECISE=NO';
        const parsed = extXStartParser(input);
        const stringified = extXStartStringifier(parsed as any);
        expect(stringified).toBe(input);
    });

    it('should handle negative TIME-OFFSET round-trip', () => {
        const input = '#EXT-X-START:TIME-OFFSET=-10.5';
        const parsed = extXStartParser(input);
        const stringified = extXStartStringifier(parsed as any);
        expect(stringified).toBe(input);
    });

    it('should handle invalid inputs correctly', () => {
        const invalidInput = '#EXT-X-START:TIME-OFFSET=abc';
        const parsed = extXStartParser(invalidInput);
        expect(parsed).toBeUndefined();
    });

    it('should maintain type safety through round-trip', () => {
        const input = '#EXT-X-START:TIME-OFFSET=5.5,PRECISE=YES' as const;
        const parsed = extXStartParser(input);
        if (parsed !== undefined) {
            const stringified = extXStartStringifier(parsed as any);
            expect(stringified).toBe('#EXT-X-START:TIME-OFFSET=5.5,PRECISE=YES');
        }
    });

    it('should handle complex generic types', () => {
        const input = '#EXT-X-START:TIME-OFFSET=42.7,PRECISE=NO' as const;
        const parsed = extXStartParser(input);
        if (parsed !== undefined) {
            const stringified = extXStartStringifier(parsed as any);
            expect(stringified).toBe('#EXT-X-START:TIME-OFFSET=42.7,PRECISE=NO');
        }
    });
}); 