import { Token } from './types'

export function transform(tokens: Token[]): string {
    return tokens.map(t => t.value).join('')
}
