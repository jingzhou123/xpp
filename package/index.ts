// @ts-ignore
import * as yargs from 'yargs'
import { Program } from "./program";

yargs.command('mock [file]', 'generate mock from api class file', (args: any) => {}, (argv: any) => {
  console.log('file:', argv.file)
  const prg = new Program()
  prg.parseApiFile((argv as any).file);
})
.argv