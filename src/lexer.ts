import { KEYWORDS } from './constants'
import { Token, TokenType } from './types'

export class Lexer {
    private readonly tokens: Token[] = []
    private index = 0

    constructor(
        private readonly source: string
    ) { }

    public lex(): Token[] {
        while(!this.eof()) {
            const ch = this.peek()
            if(this.isWhitespace(ch)) this.readWhitespace()
            else if(this.isIdentifierStart(ch)) this.readIdentifier()
            else if(this.isDigit(ch)) this.readNumber()
            else if(ch === '"' ) this.readString()
            else if(ch === "'") this.readCharacter()
            else if(ch === '/') this.readCommentOrOperator()
            else if(this.isOperator(ch)) this.readOperator()
            else this.readPunctuation()
        }

        this.tokens.push({
            type: TokenType.EOF,
            value: '',
            start: this.index,
            end: this.index
        })
        return this.tokens
    }

    private peek(offset = 0): string {
        return this.source[this.index + offset] ?? ''
    }

    private advance(): string {
        return this.source[this.index++] ?? ''
    }

    private eof(): boolean {
        return this.index >= this.source.length
    }

    private addToken(type: TokenType, value: string, start: number): void {
        this.tokens.push({
            type, value, start, end: this.index
        })
    }

    private isWhitespace(ch: string): boolean {
        return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
    }

    private isDigit(ch: string): boolean {
        return ch >= '0' && ch <= '9'
    }

    private isIdentifierStart(ch: string): boolean {
        return /[a-zA-Z_$]/.test(ch)
    }

    private isIdentifierPart(ch: string): boolean {
        return /[a-zA-Z0-9_$]/.test(ch)
    }

    private isOperator(ch: string): boolean {
        return /[+\-*/%=&|^!<>?:~]/.test(ch)
    }

    private readWhitespace(): void {
        const start = this.index
        while(!this.eof() && this.isWhitespace(this.peek())) this.advance()
        this.addToken(
            TokenType.Whitespace,
            this.source.slice(start, this.index),
            start
        )
    }

    private readIdentifier(): void {
        const start = this.index
        while(!this.eof() && this.isIdentifierPart(this.peek())) this.advance()
        const value = this.source.slice(start, this.index)
        const type = KEYWORDS.has(value) ? TokenType.Keyword : TokenType.Identifier
        this.addToken(type, value, start)
    }

    private readNumber(): void {
        const start = this.index
        while(!this.eof() && this.isDigit(this.peek())) this.advance()
        this.addToken(
            TokenType.Number,
            this.source.slice(start, this.index),
            start
        )
    }

    private readString(): void {
        const start = this.index
        this.advance()
        while(!this.eof()) {
            const ch = this.advance()
            if(ch === '\\') {
                this.advance()
                continue
            }
            if(ch === '"') break
        }
        this.addToken(
            TokenType.String,
            this.source.slice(start, this.index),
            start
        )
    }

    private readCharacter(): void {
        const start = this.index
        this.advance()
        while(!this.eof()) {
            const ch = this.advance()
            if(ch === '\\') {
                this.advance()
                continue
            }
            if(ch === "'") break
        }
        this.addToken(
            TokenType.Character,
            this.source.slice(start, this.index),
            start
        )
    }

    private readCommentOrOperator(): void {
        const start = this.index
        if(this.peek(1) === '/') {
            this.advance()
            this.advance()
            while(!this.eof() && this.peek() !== '\n') this.advance()
            this.addToken(
                TokenType.Comment,
                this.source.slice(start, this.index),
                start
            )
            return
        }
        if(this.peek(1) === '*') {
            this.advance()
            this.advance()
            while(!this.eof()) {
                if(this.peek() === '*' && this.peek(1) === '/') {
                    this.advance()
                    this.advance()
                    break
                }
                this.advance()
            }
            this.addToken(
                TokenType.Comment,
                this.source.slice(start, this.index),
                start
            )
            return
        }
        this.advance()
        this.addToken(TokenType.Operator, '/', start)
    }

    private readOperator(): void {
        const start = this.index
        this.advance()
        this.addToken(
            TokenType.Operator,
            this.source.slice(start, this.index),
            start
        )
    }

    private readPunctuation(): void {
        const start = this.index
        this.advance()
        this.addToken(
            TokenType.Punctuation,
            this.source.slice(start, this.index),
            start
        )
    }
}

export function lex(source: string): Token[] {
    return new Lexer(source).lex()
}
