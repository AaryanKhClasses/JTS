import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    clean: true,
    splitting: false,
    sourcemap: true,
    target: 'node22',
    outDir: 'build'
})
