export interface Lexical<Type extends Symbol = Symbol> {
    type: Type;
    value: unknown;
}

export interface MediaPlaylistLine {
    type: Symbol;
    source: unknown;
    value: unknown;
}
