import { Token, TokenType } from './types'

type TransformRuleResult = {
    output: string[]
    consumed: number
}
type TransformRule = (tokens: Token[], index: number) => TransformRuleResult | null

const letRule: TransformRule = (tokens, index) => {
    const token = tokens[index]
    if(
        token.type !== TokenType.Keyword || 
        token.value !== 'let'
    ) return null
    return {
        output: ['var'],
        consumed: 1
    }
}

const constRule: TransformRule = (tokens, index) => {
    const token = tokens[index]
    if(
        token.type !== TokenType.Keyword || 
        token.value !== 'const'
    ) return null
    return {
        output: ['final', ' ', 'var'],
        consumed: 1
    }
}

const consoleLogRule: TransformRule = (tokens, index) => {
    if(
        tokens[index].type !== TokenType.Identifier ||
        !match(tokens, index, 'console', '.', 'log')
    ) return null
    return {
        output: ['System', '.', 'out', '.', 'println'],
        consumed: 3
    }
}

const RULES: TransformRule[] = [
    letRule,
    constRule,
    consoleLogRule
]

export function transform(tokens: Token[]): string {
    const output: string[] = []
    let i = 0
    while(i < tokens.length) {
        const token = tokens[i]
        if(token.type === TokenType.EOF) break

        let matched = false
        for(const rule of RULES) {
            const result = rule(tokens, i)
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

function match(tokens: Token[], index: number, ...values: string[]): boolean {
    for(let i = 0; i < values.length; i++) {
        if(tokens[index + i]?.value !== values[i]) return false
    }
    return true
}
