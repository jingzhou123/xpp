import { Project, ts, Type, CodeBlockWriter } from 'ts-morph'
import * as path from 'path'
import * as fs from 'fs'

export class Program {
    constructor() {
        //
    }
    parseApiFile(pathStr: string) {
        const prj = new Project()
        const fileName = path.basename(pathStr, '.ts')
        const mockFileName = `${fileName}.mock.ts`
        const mockFilePath = path.dirname(pathStr) + '/' + mockFileName
        if (fs.existsSync(path.resolve(mockFilePath))) {
            throw new Error('file existed')
        }
        fs.copyFileSync(pathStr, mockFilePath)
        const anyApiSrc = prj.addExistingSourceFile(mockFilePath)
        const classList = anyApiSrc.getClasses()
        for (const classItem of classList) {
            console.log('class:', classItem.getName())
        }
        if (!classList.length) {
            throw new Error('not found any class')
        }
        if (classList.length > 1) {
            throw new Error('only support one class per api file')
        }
        const onlyClass = classList[0]
        if (!onlyClass) {
            throw new Error('not found any api class')
        }
        const methodList = onlyClass.getMethods()
        if (!methodList.length) {
            throw new Error('not found any method inside the class')
        }
        const methods = onlyClass.getMethods()
        for (const method of methods) {
            method.setBodyText(writer => {
                const returnTypeTxt = method.getReturnTypeNodeOrThrow().getText()
                if (!returnTypeTxt.match(/^Promise<[^>]+>/)) {
                    throw new Error('return type must be Promise')
                }
                // console.log('return type:', returnTypeTxt)
                const resolvedReturnType = method.getReturnType().getTypeArguments()[0]
                console.log('resolved return type:', resolvedReturnType.getText())
                writer.write(`return Promise.resolve(${this.resolveMock(resolvedReturnType)})`)
            })
        }
        prj.save()
    }
    private resolveMock(returnType: Type<ts.Type>) {
        if (returnType.isString()) {
            return "'any-ramdom-string'"
        } else if (returnType.isStringLiteral()) {
            return returnType.getText()
        } if (returnType.isNumber()) {
            return 100020
        } else if (returnType.isNullable()) {
            return 'void'
        } else if (returnType.getText() === 'void') {
            return ''
        } else if (returnType.isBoolean()) {
            return true
        } else if (returnType.isObject() || returnType.isInterface()) {
            const cdWriter = this.getCdWriter();
            cdWriter.block(() => {
                const props = returnType.getProperties()
                for (const prop of props) {
                    console.log('name:', prop.getName(), 'type:', prop.getValueDeclarationOrThrow().getType().getText())
                    cdWriter.write(`${prop.getName()}: ${this.resolveMock(prop.getValueDeclarationOrThrow().getType())},`)
                }
            })
            return cdWriter.toString()
        } else {
            return '{}'
        }
    }
    private getCdWriter() {
        return new CodeBlockWriter({
            useSingleQuote: true
        })
    }
}