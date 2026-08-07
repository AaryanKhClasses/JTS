import { COLLECTION_TYPES, Errors, PRIMITIVE_WRAPPERS, TYPE_MAP } from './constants'
import { DiagnosticReporter } from './diagnostics'
import { Token, TokenType } from './types'

type ParsedVariableDeclaration = {
    isConst: boolean
    name: string
    javaType: string
    nextOffset: number
}

type ParsedParameter = {
    output: string
    nextOffset: number
}

type ParsedType = {
    type: string
    nextOffset: number
}

export class TokenReader {
    constructor(
        private readonly tokens: Token[],
        private readonly index: number,
        private readonly reporter: DiagnosticReporter
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

    public resolveType(type: string): string | null {
        if(type.endsWith('[]')) {
            const element = this.resolveType(type.substring(0, type.length - 2))
            if(!element) return null
            return `${element}[]`
        }
        if(type.startsWith('Array<') && type.endsWith('>')) {
            const inner = type.substring(6, type.length - 1)
            const element = this.resolveType(inner)
            if(!element) return null
            const wrapper = PRIMITIVE_WRAPPERS.get(element) ?? element
            return `${COLLECTION_TYPES.Array}<${wrapper}>`
        }
        return TYPE_MAP.get(type) || null
    }

    public parsedParameter(offset: number): ParsedParameter | null {
        const identifier = this.next(offset)
        if(!identifier || identifier.type !== TokenType.Identifier) return null
        if(this.nextValue(offset + 1) !== ':') {
            const error = Errors.ErrorMissingTypeAnnotation(identifier.value)
            this.reporter.error(error.code, error.message, this.currentIndex(), this.nextIndex(offset + 1), error.suggestion)
            return null
        }

        const parsedType = this.parsedType(offset + 2)
        if(!parsedType) return null
        const javaType = TYPE_MAP.get(parsedType.type)
        if(!javaType) {
            const error = Errors.ErrorUnknownType(parsedType.type)
            this.reporter.error(error.code, error.message, this.currentIndex(), this.nextIndex(parsedType.nextOffset), error.suggestion)
            return null
        }
        return {
            output: `${javaType} ${identifier.value}`,
            nextOffset: parsedType.nextOffset
        }
    }

    public parsedType(offset: number): ParsedType | null {
        const first = this.next(offset)
        if(!first) return null
        let type = first.value
        let current = offset

        if(first.value === 'Array' && this.nextValue(current + 1) === '<') {
            const inner = this.parsedType(current + 2)
            if(!inner) return null
            current = inner.nextOffset
            if(this.nextValue(current + 1) !== '>') {
                const error = Errors.ErrorMissingClosingTag('>')
                this.reporter.error(error.code, error.message, this.currentIndex(), this.nextIndex(current + 1))
                return null
            }
            current++
            type = `Array<${inner.type}>`
        }

        while(this.nextValue(current + 1) === '[' && this.nextValue(current + 2) === ']') {
            type += '[]'
            current += 2
        }
        return {
            type,
            nextOffset: current
        }
    }

    public parsedLiteralType(offset: number): ParsedType | null {
        const token = this.next(offset)
        if(!token) return null
        switch(token.type) {
            case TokenType.Number: return { type: 'number', nextOffset: offset }
            case TokenType.String: return { type: 'string', nextOffset: offset }
            case TokenType.Character: return { type: 'char', nextOffset: offset }
        }

        if(token.type === TokenType.Keyword && (token.value === 'true' || token.value === 'false')) return { type: 'boolean', nextOffset: offset }
        return null
    }

    public inferArrayLiteralType(offset: number): ParsedType | null {
        if(this.nextValue(offset) !== '[') return null
        offset++
        if(this.nextValue(offset) === ']') {
            const error = Errors.ErrorEmptyArrayLiteral
            this.reporter.error(error.code, error.message, this.currentIndex(), this.nextIndex(offset), error.suggestion)
            return null
        }

        let inferredType: string | null = null
        while(this.nextValue(offset) !== ']') {
            const literal = this.parsedLiteralType(offset)
            if(!literal) return null
            if(inferredType === null) inferredType = literal.type
            else if(inferredType !== literal.type) {
                const error = Errors.ErrorMixedArrayLiteralTypes
                this.reporter.error(error.code, error.message, this.currentIndex(), this.nextIndex(literal.nextOffset), error.suggestion)
                return null
            }
            offset = literal.nextOffset + 1
            if(this.nextValue(offset) === ',') offset++
        }
        return {
            type: `${inferredType}[]`,
            nextOffset: offset
        }
    }

    public parsedVariableDeclaration(offset: number): ParsedVariableDeclaration | null {
        const keyword = this.next(offset)
        if(!keyword || keyword.type !== TokenType.Keyword || (keyword.value !== 'let' && keyword.value !== 'const')) return null

        const isConst = keyword.value === 'const'
        const identifier = this.next(offset + 1)
        if(!identifier || identifier.type !== TokenType.Identifier) return null
        if(this.nextValue(offset + 2) !== ':') return {
            isConst,
            name: identifier.value,
            javaType: 'var',
            nextOffset: offset + 1
        }

        const parsedType = this.parsedType(offset + 3)
        if(!parsedType) return null
        const javaType = this.resolveType(parsedType.type)
        if(!javaType) {
            const error = Errors.ErrorUnknownType(parsedType.type)
            this.reporter.error(error.code, error.message, this.currentIndex(), this.nextIndex(parsedType.nextOffset), error.suggestion)
            return null
        }
        return {
            isConst,
            name: identifier.value,
            javaType,
            nextOffset: parsedType.nextOffset
        }
    }
}
