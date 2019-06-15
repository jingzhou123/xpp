"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var path = require("path");
var Program = /** @class */ (function () {
    function Program() {
        //
    }
    Program.prototype.parseApiFile = function (pathStr) {
        var prj = new ts_morph_1.Project();
        var anyApiSrc = prj.addExistingSourceFile(pathStr);
        var classList = anyApiSrc.getClasses();
        if (!classList.length) {
            throw new Error('only support one class per api file');
        }
        var onlyClass = classList[0];
        if (!onlyClass) {
            throw new Error('not found any api class');
        }
        var methodList = onlyClass.getMethods();
        if (!methodList.length) {
            throw new Error('not found any method inside the class');
        }
        var fileName = path.basename(pathStr, '.ts');
        var mockFileName = fileName + ".mock.ts";
        var mockApiSrc = prj.createSourceFile(path.dirname(pathStr) + '/' + mockFileName);
        mockApiSrc.addClass({
            isExported: true,
            name: onlyClass.getName(),
            methods: methodList.map(function (method) {
                console.log('mocking api:', method.getName());
                return {
                    name: method.getName(),
                    parameters: method.getParameters().map(function (para) { return para.getStructure(); }),
                    returnType: function (writer) {
                        writer.write(method.getReturnType().getText());
                    },
                    statements: function (writer) {
                        var returnTypeTxt = method.getReturnTypeNodeOrThrow().getText();
                        if (!returnTypeTxt.match(/^Promise<[^>]+>/)) {
                            throw new Error('return type must be Promise');
                        }
                        // console.log('return type:', returnTypeTxt)
                        var resolvedReturnType = method.getReturnType().getTypeArguments()[0];
                        console.log('resolved return type:', resolvedReturnType.getText());
                        var resolveContent = '';
                        switch (resolvedReturnType.getText()) {
                            case 'number':
                                resolveContent = Math.floor(100 * Math.random()) + '';
                                break;
                            case 'string':
                                resolveContent = '"randomString"';
                                break;
                            case 'void':
                                resolveContent = '';
                                break;
                            case 'boolean':
                                resolveContent = Math.random() > 0.5 ? 'true' : 'false';
                                break;
                            default:
                                resolveContent = '{}';
                                break;
                        }
                        writer.write("return Promise.resolve(" + resolveContent + ")");
                    }
                };
            })
        });
        prj.save();
    };
    return Program;
}());
exports.Program = Program;
