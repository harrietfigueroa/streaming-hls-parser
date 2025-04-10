import discontinuitySequenceParser from './parser';
describe('EXT-X-DISCONTINUITY-SEQUENCE', () => {
    it('should parse the tag', () => {
        const test = '#EXT-X-DISCONTINUITY-SEQUENCE:8';
        const parsed = discontinuitySequenceParser(test);

        expect(parsed).toBe(8);
    });
});
