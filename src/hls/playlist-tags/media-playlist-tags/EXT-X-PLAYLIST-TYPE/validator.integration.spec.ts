import { describe, expect, it } from 'vitest';
import { extXPlaylistTypeParser } from './parser';
import { extXPlaylistTypeValidator } from './validator';

describe('EXT-X-PLAYLIST-TYPE validator integration', () => {
    it('should validate parsed valid values', () => {
        const testCases = [
            '#EXT-X-PLAYLIST-TYPE:EVENT',
            '#EXT-X-PLAYLIST-TYPE:VOD',
        ];

        testCases.forEach(testCase => {
            const parsed = extXPlaylistTypeParser(testCase);
            const result = extXPlaylistTypeValidator.validate(parsed);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    it('should handle null values from parser for invalid inputs', () => {
        const invalidInputs = [
            '#EXT-X-PLAYLIST-TYPE:',
            '#EXT-X-PLAYLIST-TYPE:event',
            '#EXT-X-PLAYLIST-TYPE:vod',
            '#EXT-X-PLAYLIST-TYPE:LIVE',
            '#EXT-X-PLAYLIST-TYPE:random',
        ];

        invalidInputs.forEach(invalidInput => {
            const parsed = extXPlaylistTypeParser(invalidInput);
            const result = extXPlaylistTypeValidator.validate(parsed);
            expect(result.isValid).toBe(true); // null is valid for optional tag
            expect(result.errors).toHaveLength(0);
        });
    });

    it('should validate EVENT value from parser', () => {
        const eventInput = '#EXT-X-PLAYLIST-TYPE:EVENT';
        const parsed = extXPlaylistTypeParser(eventInput);
        const result = extXPlaylistTypeValidator.validate(parsed);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tagName).toBe('#EXT-X-PLAYLIST-TYPE');
    });

    it('should validate VOD value from parser', () => {
        const vodInput = '#EXT-X-PLAYLIST-TYPE:VOD';
        const parsed = extXPlaylistTypeParser(vodInput);
        const result = extXPlaylistTypeValidator.validate(parsed);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should work with parser output types', () => {
        const testInput = '#EXT-X-PLAYLIST-TYPE:EVENT' as const;
        const parsed = extXPlaylistTypeParser(testInput);
        const result = extXPlaylistTypeValidator.validate(parsed);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
}); 