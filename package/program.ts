import { Project, SymbolFlags } from 'ts-morph'
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
                        let resolveContent = ''
                        switch (resolvedReturnType.getText()) {
                            case 'number':
                                resolveContent = Math.floor(100 * Math.random()) + ''
                                break;
                            case 'string':
                                resolveContent = '"randomString"'
                                break;
                            case 'void':
                                resolveContent = ''
                                break;
                            case 'boolean':
                                resolveContent = Math.random() > 0.5 ? 'true' : 'false'
                                break;
                            default:
                                resolveContent = '{}'
                                break;
                        }
                        writer.write(`return Promise.resolve(${resolveContent})`)
                    }
                }
            })
        })
        prj.save()
    }
}