import { Project, ts, Type, CodeBlockWriter } from 'ts-morph'
import * as path from 'path'

export class Program {
    constructor() {
        //
    }
    parseApiFile(pathStr: string) {
        const prj = new Project()
        const anyApiSrc = prj.addExistingSourceFile(pathStr)
        const classList = anyApiSrc.getClasses()
        if (!classList.length) {
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
        const fileName = path.basename(pathStr, '.ts')
        const mockFileName = `${fileName}.mock.ts`
        const mockApiSrc = prj.createSourceFile(path.dirname(pathStr) + '/' + mockFileName)
        mockApiSrc.addClass({
            isExported: true,
            name: onlyClass.getName(),
            methods: methodList.map(method => {
                console.log('mocking api:', method.getName())
                return {
                    name: method.getName(),
                    parameters: method.getParameters().map(para => para.getStructure()),
                    returnType: (writer) => {
                        writer.write(method.getReturnType().getText())
                    },
                    statements: (writer) => {
                        const returnTypeTxt = method.getReturnTypeNodeOrThrow().getText()
                        if (!returnTypeTxt.match(/^Promise<[^>]+>/)) {
                            throw new Error('return type must be Promise') 
                        }
                        // console.log('return type:', returnTypeTxt)
                        const resolvedReturnType = method.getReturnType().getTypeArguments()[0]
                        console.log('resolved return type:', resolvedReturnType.getText())
                        writer.write(`return Promise.resolve(${this.resolveMock(resolvedReturnType)})`)
                    }
                }
            })
        })
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
        } else if (returnType.isObject()) {
            debugger
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