import iFrameStreamInfParser from './parser';

describe('EXT-X-I-FRAME-STREAM-INF', () => {
    it('should parse out the values from an EXT-X-I-FRAME-STREAM-INF tag', () => {
        const test = '#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5"';

        const values = iFrameStreamInfParser(test);

        expect(values).toHaveProperty('BANDWIDTH', 65000);
        expect(values).toHaveProperty('CODECS', expect.arrayContaining(['"mp4a.40.5"']));
        expect(values).toHaveProperty('AUDIO', '"aac"');
    });
});
