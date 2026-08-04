import Parser, { Tree } from 'tree-sitter'
import Java from 'tree-sitter-java'

const parser = new Parser()
parser.setLanguage(Java)

export function parse(source: string): Tree {
    return parser.parse(source)
}
