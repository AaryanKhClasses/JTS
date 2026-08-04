import Parser from 'tree-sitter'
import Java from 'tree-sitter-java'
import { ParseResult } from './types'

const parser = new Parser()
parser.setLanguage(Java)

export function parse(source: string): ParseResult {
    const tree = parser.parse(source)
    return {
        tree,
        success: !tree.rootNode.hasError
    }
}
