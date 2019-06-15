import { Project } from 'ts-morph'
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
            methods: methodList.map(item => {
                return {
                    name: item.getName(),
                    returnType: (writer) => {
                        writer.write(item.getReturnType().getText())
                    },
                    statements: (writer) => {
                        writer.write('return Promise.resolve({})')
                    }
                }
            })
        })
        prj.save()
    }
}