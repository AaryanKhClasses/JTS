import fg from 'fast-glob'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { generate } from './generator'
import { lex } from './lexer'
import { parse } from './parser'
import { transform } from './transformer'
import { CompilerOptions } from './types'

export async function compile(options: CompilerOptions): Promise<void> {
    const files = await fg('**/*.jts', { cwd: options.source })
    for(const file of files) {
        const input = path.join(options.source, file)
        const output = path.join(options.output, file.replace(/\.jts$/, '.java'))
        const source = await fs.readFile(input, 'utf-8')

        const tokens = lex(source)
        const transformed = transform(tokens)
        const result = parse(transformed)
        // if(!result.success) throw new Error(`Generated Java code has syntax errors for file: ${input}`)
        const java = generate(result.tree, transformed)

        await fs.mkdir(path.dirname(output), { recursive: true })
        await fs.writeFile(output, java, 'utf-8')
    }
}
