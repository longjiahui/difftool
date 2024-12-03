#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { program } from 'commander'
import parser from 'diffparser'
import fs from 'fs'
import path from 'node:path'
import StaticServer from 'static-server'
import { getPort } from 'get-port-please'
import { open } from 'openurl'

program
    .argument('<commitA>')
    .argument('<commitB>')
    .action(async (commitA, commitB) => {
        const result = execSync(
            `git diff --submodule=diff ${commitA} ${commitB}`,
            {
                stdio: 'pipe',
                cwd: process.cwd(),
            }
        )
        const diff = parser(result.toString())
        // console.debug(`save to: ${path.resolve(__dirname, 'diff.json')}`)
        fs.writeFileSync(
            path.resolve(__dirname, 'dist/diff.json'),
            JSON.stringify(diff, null, 2)
        )
        const port = await getPort({
            random: true,
        })

        const server = new StaticServer({
            port,
            rootPath: path.resolve(__dirname, 'dist'),
        })
        server.start(async () => {
            console.log('server listening on port: ', server.port)
            open(`http://localhost:${server.port}`)
        })
    })

program.parse(process.argv)
