import { Token, TokenType } from './types'

export class TokenReader {
    constructor(
        private readonly tokens: Token[],
        private readonly index: number
    ) { }

    public current(): Token | undefined {
        return this.tokens[this.index]
    }

    public currentIndex(): number {
        return this.index
    }

    public nextValue(offset = 1): string | undefined {
        return this.next(offset)?.value
    }

    public nextType(offset = 1): TokenType | undefined {
        return this.next(offset)?.type
    }

    public next(offset = 1): Token | undefined {
        let i = this.index
        while(offset > 0) {
            i++
            while(this.tokens[i] && this.tokens[i].type === TokenType.Whitespace) i++
            offset--
        }
        return this.tokens[i]
    }

    public nextIndex(offset = 1): number {
        let i = this.index
        while(offset > 0) {
            i++
            while(this.tokens[i] && this.tokens[i].type === TokenType.Whitespace) i++
            offset--
        }
        return i
    }

    public match(...values: string[]): boolean {
        for(let i = 0; i < values.length; i++) {
            const token = i === 0 ? this.current() : this.next(i)
            if(!token || token.value !== values[i]) return false
        }
        return true
    }
}
