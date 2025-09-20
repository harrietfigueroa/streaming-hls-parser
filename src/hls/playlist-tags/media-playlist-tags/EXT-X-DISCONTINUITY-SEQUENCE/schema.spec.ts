import { describe, expect, it } from 'vitest';
import { EXT_X_DISCONTINUITY_SEQUENCE_CODEC } from './schemas';

describe('EXT-X-DISCONTINUITY-SEQUENCE schema', () => {
    describe('EXT_X_DISCONTINUITY_SEQUENCE_CODEC decoding', () => {
        it('should parse valid attribute list', () => {
            const input = '#EXT-X-DISCONTINUITY-SEQUENCE:10';
            const result = EXT_X_DISCONTINUITY_SEQUENCE_CODEC.decode(input);
            expect(result).toBe(10);
        });
    });
    describe('EXT_X_DISCONTINUITY_SEQUENCE_CODEC encoding', () => {
        it('should encode valid attribute list', () => {
            const input = 10;
            const result = EXT_X_DISCONTINUITY_SEQUENCE_CODEC.encode(input);
            expect(result).toBe('#EXT-X-DISCONTINUITY-SEQUENCE:10');
        });
    });
});
