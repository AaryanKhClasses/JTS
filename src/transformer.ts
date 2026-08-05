import { TokenReader } from './reader'
import { Token, TokenType } from './types'

type TransformRuleResult = {
    output: string[]
    consumed: number
}
type TransformRule = (reader: TokenReader) => TransformRuleResult | null

const TYPE_MAP = new Map<string, string>([
    ['number', 'int'],
    ['string', 'String'],
    ['boolean', 'boolean'],
    ['any', 'Object']
])

const variableDeclarationRule: TransformRule = (reader) => {
    const keyword = reader.current()
    if(
        keyword?.type !== TokenType.Keyword ||
        (keyword.value !== 'let' && keyword.value !== 'const')
    ) return null

    const isConst = keyword.value === 'const'
    const identifier = reader.next(1)
    if(!identifier || identifier.type !== TokenType.Identifier) return null

    if(reader.nextValue(2) !== ':') return {
        output: isConst ? emit('final', ' ', 'var') : emit('var'),
        consumed: 1
    }

    const typeToken = reader.next(3)
    if(!typeToken) return null
    const javaType = TYPE_MAP.get(typeToken.value)
    if(!javaType) return null
    return {
        output: isConst
            ? emit('final ', javaType, ' ', identifier.value)
            : emit(javaType, ' ', identifier.value),
        consumed: reader.nextIndex(3) - reader.currentIndex() + 1
    }
}

const consoleLogRule: TransformRule = (reader) => {
    const token = reader.current()
    if(!token) return null
    if(token.type !== TokenType.Identifier || token.value !== 'console') return null
    if(reader.next(1)?.type !== TokenType.Punctuation || reader.next(1)?.value !== '.' ) return null
    if(reader.next(2)?.type === TokenType.Identifier || reader.next(2)?.value === 'log') return {
        output: emit('System', '.', 'out', '.', 'println'),
        consumed: 3
    }
    else if(reader.next(2)?.type === TokenType.Identifier || reader.next(2)?.value === 'error') return {
        output: emit('System', '.', 'err', '.', 'println'),
        consumed: 3
    }
    return null
}

const RULES: TransformRule[] = [
    variableDeclarationRule,
    consoleLogRule
]

export function transform(tokens: Token[]): string {
    const output: string[] = []
    let i = 0
    while(i < tokens.length) {
        const token = tokens[i]
        if(token.type === TokenType.EOF) break
        const reader = new TokenReader(tokens, i)

        let matched = false
        for(const rule of RULES) {
            const result = rule(reader)
            if(result === null) continue
            output.push(...result.output)
            i += result.consumed
            matched = true
            break
        }
        if(!matched) {
            output.push(token.value)
            i++
        }
    }
    return output.join('')
}


function emit(...parts: string[]): string[] {
    return [parts.join('')]
}
