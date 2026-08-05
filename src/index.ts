#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'
import { compile } from './compiler'
import * as pkg from '../package.json'

const program = new Command()
program.name('jts').version(pkg.version)

program.command('version')
.description('Display the current version of JTS')
.action(() => {
    console.log(chalk.cyan(`JTS version: ${pkg.version}`))
})

program.command('build')
.description('Transpile given JTS source files to Java source files')
.action(async() => {
    console.log(chalk.cyan('Building project...\n'))
    await compile({
        source: 'test',
        output: 'test/out'
    })
    console.log(chalk.green('\nBuild completed successfully!'))
})

program.parse()
