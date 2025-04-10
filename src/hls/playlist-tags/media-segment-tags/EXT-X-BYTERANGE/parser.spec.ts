import parser from './parser';

describe('EXT-X-BYTERANGE', () => {
    it('should parse with a single param', () => {
        const test = '#EXT-X-BYTERANGE:16920';
        const parsed: number | [number, number] = parser(test);

        expect(parsed).toBe(16920);
    });

    it('should parse with two params', () => {
        const test = '#EXT-X-BYTERANGE:16920@49256';
        const parsed: [number, number] = parser(test);

        expect(parsed).toStrictEqual(expect.arrayContaining([16920, 49256]));
    });
});
