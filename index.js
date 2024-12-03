"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const commander_1 = require("commander");
commander_1.program
    .argument('<commitA>')
    .argument('<commitB>')
    .action((commitA, commitB) => {
    const result = (0, node_child_process_1.execSync)(`git diff ${commitA} ${commitB}`, {
        stdio: 'pipe',
    });
    // console.log(result.toString())
});
commander_1.program.parse(process.argv);
