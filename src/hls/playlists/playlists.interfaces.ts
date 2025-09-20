export interface Playlist {
    toHLS(): string;
    toJSON(): unknown;
    isValid: boolean;
    errors: Error[];
}