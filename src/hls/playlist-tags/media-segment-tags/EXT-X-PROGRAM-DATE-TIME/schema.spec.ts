import { describe, it, expect } from 'vitest';
import { EXT_X_PROGRAM_DATE_TIME_CODEC } from './schema';

describe('EXT_X_PROGRAM_DATE_TIME_CODEC', () => {
    describe('EXT_X_PROGRAM_DATE_TIME_CODEC decoding', () => {
        it('should decode a valid EXT_X_PROGRAM_DATE_TIME tag', () => {
            const tag = '#EXT-X-PROGRAM-DATE-TIME:2025-09-19T04:07:10.592Z';
            const result = EXT_X_PROGRAM_DATE_TIME_CODEC.safeDecode(tag);
            expect(result.error).toBeUndefined();
            expect(result.data).toBeInstanceOf(Date);
            expect(result.data?.toISOString()).toBe('2025-09-19T04:07:10.592Z');
        });
    });

    describe('EXT_X_PROGRAM_DATE_TIME_CODEC encoding', () => {
        it('should encode a valid EXT_X_PROGRAM_DATE_TIME tag', () => {
            const input = new Date('2025-09-19T04:07:10.592Z');
            const result = EXT_X_PROGRAM_DATE_TIME_CODEC.safeEncode(input);
            expect(result.error).toBeUndefined();
            expect(result.data).toBe('#EXT-X-PROGRAM-DATE-TIME:2025-09-19T04:07:10.592Z');
        });
    });
});
