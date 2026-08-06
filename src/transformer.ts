import { COLLECTION_TYPES, Constants, PRIMITIVE_WRAPPERS, TYPE_MAP } from './constants'
import { TokenReader } from './reader'
import { Token, TokenType } from './types'

type TransformRuleResult = {
    output: string
    consumed: number
}
type TransformRule = (reader: TokenReader) => TransformRuleResult | null

const variableDeclarationRule: TransformRule = (reader) => {
    const keyword = reader.current()
    if(
        keyword?.type !== TokenType.Keyword ||
        (keyword.value !== 'let' && keyword.value !== 'const')
    ) return null

    const isConst = keyword.value === 'const'
    const identifier = reader.next(1)
    if(!identifier || identifier.type !== TokenType.Identifier) return null

    if(reader.nextValue(2) !== ':') {
        if(reader.nextValue(2) === '=') {
            const inferred = reader.inferArrayLiteralType(3)
            if(inferred) {
                const javaType = resolveType(inferred.type)
                return {
                    output: isConst
                        ? emit('final ', javaType!, ' ', identifier.value)
                        : emit(javaType!, ' ', identifier.value),
                    consumed: reader.nextIndex(1) - reader.currentIndex() + 1
                }
            }
        }
        return {
            output: isConst ? emit('final', ' ', 'var') : emit('var'),
            consumed: 1
        }
    }

    const parsedType = reader.parsedType(3)
    if(!parsedType) return null
    const javaType = resolveType(parsedType.type)
    if(!javaType) return null
    return {
        output: isConst
            ? emit('final ', javaType, ' ', identifier.value)
            : emit(javaType, ' ', identifier.value),
        consumed: reader.nextIndex(parsedType.nextOffset) - reader.currentIndex() + 1
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

const functionRule: TransformRule = (reader) => {
    const keyword = reader.current()
    if(!keyword || keyword.type !== TokenType.Keyword || keyword.value !== 'function') return null
    const name = reader.next(1)
    if(!name || name.type !== TokenType.Identifier) return null
    if(reader.nextValue(2) !== '(') return null

    const parameters: string[] = []
    let offset = 3
    while(reader.nextValue(offset) !== ')') {
        const parameter = reader.parsedParameter(offset)
        if(!parameter) return null
        parameters.push(parameter.output)
        offset = parameter.nextOffset + 1
        if(reader.nextValue(offset) === ',') offset++
    }
    offset++

    if(reader.nextValue(offset) !== ':') throw new Error(Constants.ErrorMissingFunctionReturnTypeAnnotation(name.value))
    const parsedType = reader.parsedType(offset + 1)
    if(!parsedType) return null
    const returnType = resolveType(parsedType.type)
    if(!returnType) throw new Error(Constants.ErrorUnknownType(parsedType.type))
    return {
        output: emit(returnType, ' ', name.value, '(', parameters.join(', '), ')'),
        consumed: reader.nextIndex(parsedType.nextOffset) - reader.currentIndex() + 1
    }
}

const arrayLiteralRule: TransformRule = (reader) => {
    if(reader.current()?.value !== '=' || reader.nextValue(1) !== '[') return null
    const output: string[] = ['=', ' ', '{']

    let offset = 2, depth = 1
    while(depth > 0) {
        const token = reader.next(offset)
        if(!token) return null
        if(token.value === '[') {
            depth++
            output.push('{')
        }
        else if(token.value === ']') {
            depth--
            output.push('}')
        }
        else output.push(token.value)
        offset++
    }
    return {
        output: emit(...output),
        consumed: reader.nextIndex(offset - 1) - reader.currentIndex() + 1
    }
}

const RULES: TransformRule[] = [
    variableDeclarationRule,
    consoleLogRule,
    functionRule,
    arrayLiteralRule
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
            output.push(result.output)
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


function emit(...parts: string[]): string {
    return parts.join('')
}

function resolveType(type: string): string | null {
    if(type.endsWith('[]')) {
        const element = resolveType(type.substring(0, type.length - 2))
        if(!element) return null
        return `${element}[]`
    }
    if(type.startsWith('Array<') && type.endsWith('>')) {
        const inner = type.substring(6, type.length - 1)
        const element = resolveType(inner)
        if(!element) return null
        const wrapper = PRIMITIVE_WRAPPERS.get(element) ?? element
        return `${COLLECTION_TYPES.Array}<${wrapper}>`
    }
    return TYPE_MAP.get(type) || null
}
