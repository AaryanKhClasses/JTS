import { Errors } from './constants'
import { DiagnosticReporter } from './diagnostics'
import { TokenReader } from './reader'
import { Token, TokenType } from './types'

type TransformRuleResult = {
    output: string
    consumed: number
}
type TransformRule = (reader: TokenReader, reporter: DiagnosticReporter) => TransformRuleResult | null

const variableDeclarationRule: TransformRule = (reader, reporter) => {
    const declaration = reader.parsedVariableDeclaration(0)
    if(!declaration) return null

    if(declaration.javaType === 'var' && reader.nextValue(2) === '=') {
        const inferred = reader.inferArrayLiteralType(3)
        if(inferred) {
            const javaType = reader.resolveType(inferred.type)
            if(!javaType) {
                const error = Errors.ErrorUnknownType(inferred.type)
                reporter.error(error.code, error.message, reader.currentIndex(), reader.nextIndex(inferred.nextOffset), error.suggestion)
                return null
            }
            return {
                output: emit(declaration.isConst ? 'final ' : '', javaType!, ' ', declaration.name),
                consumed: reader.nextIndex(1) - reader.currentIndex() + 1
            }
        }
    }

    return {
        output: emit(declaration.isConst ? 'final ' : '', declaration.javaType, ' ', declaration.name),
        consumed: reader.nextIndex(declaration.nextOffset) - reader.currentIndex() + 1
    }
}

const consoleLogRule: TransformRule = (reader) => {
    const token = reader.current()
    if(!token) return null
    if(token.type !== TokenType.Identifier || token.value !== 'console') return null
    if(reader.next(1)?.type !== TokenType.Punctuation || reader.next(1)?.value !== '.' ) return null
    if(reader.next(2)?.type === TokenType.Identifier && reader.next(2)?.value === 'log') return {
        output: emit('System', '.', 'out', '.', 'println'),
        consumed: 3
    }
    else if(reader.next(2)?.type === TokenType.Identifier && reader.next(2)?.value === 'error') return {
        output: emit('System', '.', 'err', '.', 'println'),
        consumed: 3
    }
    return null
}

const functionRule: TransformRule = (reader, reporter) => {
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

    if(reader.nextValue(offset) !== ':') {
        const error = Errors.ErrorMissingFunctionReturnTypeAnnotation(name.value)
        reporter.error(error.code, error.message, reader.currentIndex(), reader.nextIndex(offset), error.suggestion)
        return null
    }
    const parsedType = reader.parsedType(offset + 1)
    if(!parsedType) return null
    const returnType = reader.resolveType(parsedType.type)
    if(!returnType) {
        const error = Errors.ErrorUnknownType(parsedType.type)
        reporter.error(error.code, error.message, reader.currentIndex(), reader.nextIndex(parsedType.nextOffset), error.suggestion)
        return null
    }
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

const forOfRule: TransformRule = (reader) => {
    if(reader.current()?.type !== TokenType.Keyword || reader.current()?.value !== 'for') return null
    if(reader.nextValue(1) !== '(') return null

    const declaration = reader.parsedVariableDeclaration(2)
    if(!declaration) return null
    if(reader.nextValue(declaration.nextOffset + 1) !== 'of') return null

    const iterable = reader.next(declaration.nextOffset + 2)
    if(!iterable || (iterable.type !== TokenType.Identifier)) return null
    if(reader.nextValue(declaration.nextOffset + 3) !== ')') return null

    return {
        output: emit('for', '(', declaration.isConst ? 'final ' : '', declaration.javaType, ' ', declaration.name, ' : ', iterable.value, ')'),
        consumed: reader.nextIndex(declaration.nextOffset + 3) - reader.currentIndex() + 1
    }
}

const forInRule: TransformRule = (reader) => {
    if(reader.current()?.type !== TokenType.Keyword || reader.current()?.value !== 'for') return null
    if(reader.nextValue(1) !== '(') return null

    const declaration = reader.parsedVariableDeclaration(2)
    if(!declaration) return null
    if(reader.nextValue(declaration.nextOffset + 1) !== 'in') return null

    const iterable = reader.next(declaration.nextOffset + 2)
    if(!iterable || (iterable.type !== TokenType.Identifier)) return null
    if(reader.nextValue(declaration.nextOffset + 3) !== ')') return null

    return {
        output: emit('for', '(', declaration.isConst ? 'final ' : '', declaration.javaType, ' ', declaration.name, ' : ', iterable.value, '.keySet()', ')'),
        consumed: reader.nextIndex(declaration.nextOffset + 3) - reader.currentIndex() + 1
    }
}

const RULES: TransformRule[] = [
    variableDeclarationRule,
    consoleLogRule,
    functionRule,
    arrayLiteralRule,
    forOfRule,
    forInRule
]

export function transform(tokens: Token[], reporter: DiagnosticReporter): string {
    const output: string[] = []
    let i = 0
    while(i < tokens.length) {
        const token = tokens[i]
        if(token.type === TokenType.EOF) break
        const reader = new TokenReader(tokens, i, reporter)

        let matched = false
        for(const rule of RULES) {
            const result = rule(reader, reporter)
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
