import Parser from 'tree-sitter'

export interface CompilerOptions {
    source: string
    output: string
}

export interface ParseResult {
    tree: Parser.Tree
    success: boolean
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
