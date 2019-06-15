"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var yargs = require("yargs");
var program_1 = require("./program");
yargs.command('mock [file]', 'generate mock from api class file', function (args) { }, function (argv) {
    console.log('file:', argv.file);
    var prg = new program_1.Program();
    prg.parseApiFile(argv.file);
})
    .argv;
