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
    .option('-j --json <TOFILE>', 'generate json file')
    .option('-fr --file-raw <FROMFILE>', 'serve from raw diff file')
    .option('-f --file-json <FROMFILE>', 'serve from json diff file')
    .argument('[commitA]')
    .argument('[commitB]')
    .action(
        async (
            commitA,
            commitB,
            options: {
                json?: string
                fileRaw?: string
                fileJson?: string
            } = {}
        ) => {
            let result = ''
            let diff: any
            if (!options.fileJson) {
                if (options.fileRaw) {
                    result = fs
                        .readFileSync(
                            path.resolve(process.cwd(), options.fileRaw)
                        )
                        .toString()
                } else {
                    result = execSync(
                        `git diff --submodule=diff ${commitA} ${commitB}`,
                        {
                            stdio: 'pipe',
                            cwd: process.cwd(),
                        }
                    ).toString()
                }
                diff = parser(result.toString())
            } else {
                diff = JSON.parse(
                    fs
                        .readFileSync(
                            path.resolve(process.cwd(), options.fileJson)
                        )
                        .toString()
                )
            }

            const toPath = options.json
                ? path.resolve(process.cwd(), options.json)
                : path.resolve(__dirname, 'dist/diff.json')
            fs.writeFileSync(toPath, JSON.stringify(diff, null, 2))

            if (!options.json) {
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
            }
        }
    )

program.parse(process.argv)
