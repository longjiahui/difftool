import { execSync } from 'node:child_process'
import { program } from 'commander'

program
    .argument('<commitA>')
    .argument('<commitB>')
    .action((commitA, commitB) => {
        const result = execSync(`git diff ${commitA} ${commitB}`, {
            stdio: 'pipe',
        })
        console.log(result.toString())
    })

program.parse(process.argv)
