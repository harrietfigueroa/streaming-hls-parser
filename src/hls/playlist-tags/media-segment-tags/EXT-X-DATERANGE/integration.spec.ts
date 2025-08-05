import { describe, it, expect } from 'vitest';
import { extXDateRangeParser } from './parser';
import { extXDateRangeStringifier } from './stringifier';
import { EXT_X_DATERANGE_PARSED } from './types';

describe('EXT-X-DATERANGE integration', () => {
    describe('parser-stringifier round-trip', () => {
        it('should parse and stringify basic EXT-X-DATERANGE', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });

        it('should parse and stringify EXT-X-DATERANGE with all attributes', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400,SCTE35-CMD=test-cmd,SCTE35-OUT=test-out,SCTE35-IN=test-in,END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });

        it('should parse and stringify EXT-X-DATERANGE with optional attributes only', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",DURATION=3600';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });

        it('should parse and stringify EXT-X-DATERANGE with END-ON-NEXT', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });

        it('should parse and stringify EXT-X-DATERANGE with zero duration', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",DURATION=0';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });

        it('should parse and stringify EXT-X-DATERANGE with large duration', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",DURATION=999999.999';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });

        it('should parse and stringify EXT-X-DATERANGE with precise dates', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T12:30:45.123Z",END-DATE="2023-01-02T12:30:45.123Z"';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            expect(stringified).toBe(input);
        });
    });

    describe('type safety', () => {
        it('should maintain type safety through round-trip', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            // Type should be preserved
            expect(typeof parsed?.ID).toBe('string');
            expect(parsed?.['START-DATE']).toBeInstanceOf(Date);
            expect(typeof stringified).toBe('string');
        });

        it('should handle complex types correctly', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400' as const;
            const parsed = extXDateRangeParser(input);

            expect(parsed).toBeDefined();
            if (parsed) {
                expect(typeof parsed.ID).toBe('string');
                expect(typeof parsed.CLASS).toBe('string');
                expect(parsed['START-DATE']).toBeInstanceOf(Date);
                expect(typeof parsed.DURATION).toBe('number');
                expect(typeof parsed['PLANNED-DURATION']).toBe('number');
            }
        });
    });

    describe('edge cases', () => {
        it('should handle undefined parser result', () => {
            const input = '#EXT-X-DATERANGE:INVALID';
            const parsed = extXDateRangeParser(input);

            expect(parsed).toBeUndefined();
        });

        it('should handle empty string input', () => {
            const parsed = extXDateRangeParser('');
            expect(parsed).toBeUndefined();
        });

        it('should handle undefined input', () => {
            const parsed = extXDateRangeParser(undefined);
            expect(parsed).toBeUndefined();
        });
    });

    describe('data integrity', () => {
        it('should preserve all attribute values through round-trip', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400,SCTE35-CMD="test-cmd",SCTE35-OUT="test-out",SCTE35-IN="test-in",END-ON-NEXT=YES';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.ID).toBe('test-id');
                expect(parsed.CLASS).toBe('test-class');
                expect(parsed['START-DATE']).toEqual(new Date('2023-01-01T00:00:00.000Z'));
                expect(parsed['END-DATE']).toEqual(new Date('2023-01-02T00:00:00.000Z'));
                expect(parsed.DURATION).toBe(86400);
                expect(parsed['PLANNED-DURATION']).toBe(86400);
                expect(parsed['SCTE35-CMD']).toBe('test-cmd');
                expect(parsed['SCTE35-OUT']).toBe('test-out');
                expect(parsed['SCTE35-IN']).toBe('test-in');
                expect(parsed['END-ON-NEXT']).toBe('YES');
            }
        });

        it('should handle optional attributes correctly', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"';
            const parsed = extXDateRangeParser(input);
            const stringified = extXDateRangeStringifier(parsed!);

            expect(parsed).toBeDefined();
            if (parsed) {
                expect(parsed.ID).toBe('test-id');
                expect(parsed['START-DATE']).toEqual(new Date('2023-01-01T00:00:00.000Z'));
                expect(parsed.CLASS).toBeUndefined();
            }
        });
    });
}); 