import parser from './parser';

describe('EXT-X-BYTERANGE', () => {
    it('should parse with a single param', () => {
        const test = '#EXT-X-BYTERANGE:16920';
        const parsed = parser(test);

        expect(parsed.LENGTH).toBe(16920);
    });

    it('should parse with two params', () => {
        const test = '#EXT-X-BYTERANGE:16920@49256';
        const parsed = parser(test);

        expect(parsed).toStrictEqual(expect.objectContaining({ LENGTH: 16920, OFFSET: 49256 }));
    });
});
