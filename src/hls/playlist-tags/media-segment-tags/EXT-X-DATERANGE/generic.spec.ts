import { describe, it, expect } from 'vitest';
import { extXDateRangeParser } from './parser';
import { EXT_X_DATERANGE_PARSED } from './types';

describe('EXT-X-DATERANGE generic type inference', () => {
    describe('basic type inference', () => {
        it('should infer correct types for basic input', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const result = extXDateRangeParser(input);

            // Type should be inferred correctly
            expect(result).toBeDefined();
            if (result) {
                // These type checks ensure the generic types are working correctly
                expect(typeof result.ID).toBe('string');
                expect(result['START-DATE']).toBeInstanceOf(Date);
            }
        });

        it('should handle optional attributes with type inference', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                expect(typeof result.ID).toBe('string');
                expect(typeof result.CLASS).toBe('string');
                expect(result['START-DATE']).toBeInstanceOf(Date);
            }
        });
    });

    describe('complex type inference', () => {
        it('should handle all optional attributes with type inference', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400,SCTE35-CMD="test-cmd",SCTE35-OUT="test-out",SCTE35-IN="test-in",END-ON-NEXT=YES' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                expect(typeof result.ID).toBe('string');
                expect(typeof result.CLASS).toBe('string');
                expect(result['START-DATE']).toBeInstanceOf(Date);
                expect(result['END-DATE']).toBeInstanceOf(Date);
                expect(typeof result.DURATION).toBe('number');
                expect(typeof result['PLANNED-DURATION']).toBe('number');
                expect(typeof result['SCTE35-CMD']).toBe('string');
                expect(typeof result['SCTE35-OUT']).toBe('string');
                expect(typeof result['SCTE35-IN']).toBe('string');
                expect(result['END-ON-NEXT']).toBe('YES');
            }
        });

        it('should handle numeric attributes with type inference', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",DURATION=3600.5,PLANNED-DURATION=7200.25' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                expect(typeof result.DURATION).toBe('number');
                expect(typeof result['PLANNED-DURATION']).toBe('number');
                expect(result.DURATION).toBe(3600.5);
                expect(result['PLANNED-DURATION']).toBe(7200.25);
            }
        });

        it('should handle date attributes with type inference', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T12:30:45.123Z",END-DATE="2023-01-02T12:30:45.123Z"' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                expect(result['START-DATE']).toBeInstanceOf(Date);
                expect(result['END-DATE']).toBeInstanceOf(Date);
                expect(result['START-DATE']).toEqual(new Date('2023-01-01T12:30:45.123Z'));
                expect(result['END-DATE']).toEqual(new Date('2023-01-02T12:30:45.123Z'));
            }
        });
    });

    describe('conditional types', () => {
        it('should handle conditional types for optional attributes', () => {
            const inputWithClass = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const inputWithoutClass = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"' as const;

            const resultWithClass = extXDateRangeParser(inputWithClass);
            const resultWithoutClass = extXDateRangeParser(inputWithoutClass);

            expect(resultWithClass).toBeDefined();
            expect(resultWithoutClass).toBeDefined();

            if (resultWithClass && resultWithoutClass) {
                expect(typeof resultWithClass.CLASS).toBe('string');
                expect(resultWithoutClass.CLASS).toBeUndefined();
            }
        });

        it('should handle conditional types for END-ON-NEXT', () => {
            const inputWithEndOnNext = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-ON-NEXT=YES' as const;
            const inputWithoutEndOnNext = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"' as const;

            const resultWithEndOnNext = extXDateRangeParser(inputWithEndOnNext);
            const resultWithoutEndOnNext = extXDateRangeParser(inputWithoutEndOnNext);

            expect(resultWithEndOnNext).toBeDefined();
            expect(resultWithoutEndOnNext).toBeDefined();

            if (resultWithEndOnNext && resultWithoutEndOnNext) {
                expect(resultWithEndOnNext['END-ON-NEXT']).toBe('YES');
                expect(resultWithoutEndOnNext['END-ON-NEXT']).toBeUndefined();
            }
        });
    });

    describe('type safety with complex inputs', () => {
        it('should maintain type safety with mixed attribute types', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z",DURATION=86400,END-ON-NEXT=YES' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                // Type assertions to ensure generic types are working
                const id: string = result.ID;
                const startDate: Date = result['START-DATE'];
                const duration: number = result.DURATION!;
                const endOnNext: 'YES' = result['END-ON-NEXT']!;

                expect(typeof id).toBe('string');
                expect(startDate).toBeInstanceOf(Date);
                expect(typeof duration).toBe('number');
                expect(endOnNext).toBe('YES');
            }
        });

        it('should handle undefined optional attributes correctly', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                // These should be undefined for this input
                expect(result.CLASS).toBeUndefined();
                expect(result['END-DATE']).toBeUndefined();
                expect(result.DURATION).toBeUndefined();
                expect(result['PLANNED-DURATION']).toBeUndefined();
                expect(result['END-ON-NEXT']).toBeUndefined();
            }
        });
    });

    describe('generic parameter constraints', () => {
        it('should work with different string literal types', () => {
            const input1 = '#EXT-X-DATERANGE:ID="id1",START-DATE="2023-01-01T00:00:00.000Z"' as const;
            const input2 = '#EXT-X-DATERANGE:ID="id2",START-DATE="2023-01-01T00:00:00.000Z"' as const;

            const result1 = extXDateRangeParser(input1);
            const result2 = extXDateRangeParser(input2);

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();

            if (result1 && result2) {
                expect(result1.ID).toBe('id1');
                expect(result2.ID).toBe('id2');
            }
        });

        it('should handle complex attribute combinations', () => {
            const input = '#EXT-X-DATERANGE:ID="test-id",CLASS="test-class",START-DATE="2023-01-01T00:00:00.000Z",END-DATE="2023-01-02T00:00:00.000Z",DURATION=86400,PLANNED-DURATION=86400,SCTE35-CMD="test-cmd",SCTE35-OUT="test-out",SCTE35-IN="test-in",END-ON-NEXT=YES' as const;
            const result = extXDateRangeParser(input);

            expect(result).toBeDefined();
            if (result) {
                // Test that all attributes are correctly typed
                const typedResult: EXT_X_DATERANGE_PARSED = result;
                expect(typedResult.ID).toBe('test-id');
                expect(typedResult.CLASS).toBe('test-class');
                expect(typedResult['START-DATE']).toEqual(new Date('2023-01-01T00:00:00.000Z'));
                expect(typedResult['END-DATE']).toEqual(new Date('2023-01-02T00:00:00.000Z'));
                expect(typedResult.DURATION).toBe(86400);
                expect(typedResult['PLANNED-DURATION']).toBe(86400);
                expect(typedResult['SCTE35-CMD']).toBe('test-cmd');
                expect(typedResult['SCTE35-OUT']).toBe('test-out');
                expect(typedResult['SCTE35-IN']).toBe('test-in');
                expect(typedResult['END-ON-NEXT']).toBe('YES');
            }
        });
    });
}); 