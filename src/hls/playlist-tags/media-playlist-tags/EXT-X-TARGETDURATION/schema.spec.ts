import { describe, expect, it } from 'vitest';
import { EXT_X_TARGETDURATION_CODEC } from './schema';

describe('EXT-X-TARGETDURATION schema', () => {
    describe('EXT_X_TARGETDURATION_CODEC decoding', () => {
        it('should parse valid attribute list', () => {
            const input = '#EXT-X-TARGETDURATION:10';
            const result = EXT_X_TARGETDURATION_CODEC.decode(input);
            expect(result).toBe(10);
        });
    });
    describe('EXT_X_TARGETDURATION_CODEC encoding', () => {
        it('should encode valid attribute list', () => {
            const input = 10;
            const result = EXT_X_TARGETDURATION_CODEC.encode(input);
            expect(result).toBe('#EXT-X-TARGETDURATION:10');
        });
    });
});
