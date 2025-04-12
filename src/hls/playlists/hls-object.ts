export abstract class HLSObject<HLSObjectProperties> {
    protected error?: Error;

    abstract toHLSLines(): Iterable<string>;
    abstract toJSON(): HLSObjectProperties;
    public toString(): string {
        return Array.from(this.toHLSLines()).join('\n');
    }
}
