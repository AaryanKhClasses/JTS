import fg from 'fast-glob'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { DiagnosticReporter } from './diagnostics'
import { generate } from './generator'
import { lex } from './lexer'
import { parse } from './parser'
import { transform } from './transformer'
import { CompilerOptions } from './types'

export async function compile(options: CompilerOptions): Promise<void> {
    const files = await fg('**/*.jts', { cwd: options.source })
    const reporter = new DiagnosticReporter()
    for(const file of files) {
        const input = path.join(options.source, file)
        const output = path.join(options.output, file.replace(/\.jts$/, '.java'))
        const source = await fs.readFile(input, 'utf-8')

        const tokens = lex(source)
        const transformed = transform(tokens, reporter)
        if(reporter.hasErrors()) {
            for(const diagnostic of reporter.getDiagnostics()) {
                console.error(`${diagnostic.severity === 0 ? 'Error' : 'Warning'} [${diagnostic.code}] at ${file}: ${diagnostic.message}\n${diagnostic.suggestion ? `Suggestion: ${diagnostic.suggestion}` : ''}`)
            }
            process.exit(1)
        }
        const result = parse(transformed)
        if(!result.success) throw new Error(`Generated Java code has syntax errors for file: ${input}`)
        const java = generate(result.tree, transformed)

        await fs.mkdir(path.dirname(output), { recursive: true })
        await fs.writeFile(output, java, 'utf-8')
    }
}
