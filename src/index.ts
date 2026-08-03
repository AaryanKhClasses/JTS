#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'
import { compile } from './compiler'

const program = new Command()
program.name('jts').version('0.0.1')

program.command('build')
.action(async() => {
    console.log(chalk.cyan('Building project...\n'))
    await compile({
        source: 'test',
        output: 'test/out'
    })
    console.log(chalk.green('\nBuild completed successfully!'))
})

program.parse()
