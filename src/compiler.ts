import fg from 'fast-glob'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { CompilerOptions } from './types'

export async function compile(options: CompilerOptions): Promise<void> {
    const files = await fg('**/*.jts', { cwd: options.source })
    for(const file of files) {
        const input = path.join(options.source, file)
        const output = path.join(options.output, file.replace(/\.jts$/, '.java'))

        const source = await fs.readFile(input, 'utf-8')
        const java = source
        await fs.mkdir(path.dirname(output), { recursive: true })
        await fs.writeFile(output, java, 'utf-8')
    }
}
