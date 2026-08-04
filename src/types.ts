export interface CompilerOptions {
    source: string
    output: string
}

export enum TokenType {
    Identifier, Keyword, Number, String, Character,
    Comment, Symbol, Whitespace, EOF, Operator, Punctuation
}

export interface Token {
    type: TokenType
    value: string
    start: number
    end: number
}
