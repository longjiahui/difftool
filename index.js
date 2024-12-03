#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const commander_1 = require("commander");
const diffparser_1 = __importDefault(require("diffparser"));
const fs_1 = __importDefault(require("fs"));
const node_path_1 = __importDefault(require("node:path"));
const static_server_1 = __importDefault(require("static-server"));
const get_port_please_1 = require("get-port-please");
const openurl_1 = require("openurl");
commander_1.program
    .option('-j --json <TOFILE>', 'generate json file')
    .option('-fr --file-raw <FROMFILE>', 'serve from raw diff file')
    .option('-f --file-json <FROMFILE>', 'serve from json diff file')
    .argument('[commitA]')
    .argument('[commitB]')
    .action((commitA_1, commitB_1, ...args_1) => __awaiter(void 0, [commitA_1, commitB_1, ...args_1], void 0, function* (commitA, commitB, options = {}) {
    let result = '';
    let diff;
    if (!options.fileJson) {
        if (options.fileRaw) {
            result = fs_1.default
                .readFileSync(node_path_1.default.resolve(process.cwd(), options.fileRaw))
                .toString();
        }
        else {
            result = (0, node_child_process_1.execSync)(`git diff --submodule=diff ${commitA} ${commitB}`, {
                stdio: 'pipe',
                cwd: process.cwd(),
            }).toString();
        }
        diff = (0, diffparser_1.default)(result.toString());
    }
    else {
        diff = JSON.parse(fs_1.default
            .readFileSync(node_path_1.default.resolve(process.cwd(), options.fileJson))
            .toString());
    }
    const toPath = options.json
        ? node_path_1.default.resolve(process.cwd(), options.json)
        : node_path_1.default.resolve(__dirname, 'dist/diff.json');
    fs_1.default.writeFileSync(toPath, JSON.stringify(diff, null, 2));
    if (!options.json) {
        const port = yield (0, get_port_please_1.getPort)({
            random: true,
        });
        const server = new static_server_1.default({
            port,
            rootPath: node_path_1.default.resolve(__dirname, 'dist'),
        });
        server.start(() => __awaiter(void 0, void 0, void 0, function* () {
            console.log('server listening on port: ', server.port);
            (0, openurl_1.open)(`http://localhost:${server.port}`);
        }));
    }
}));
commander_1.program.parse(process.argv);
