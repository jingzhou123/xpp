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
                        // const returnTypeTxt = method.getReturnTypeNodeOrThrow().getText()
                        // console.log('return type:', returnTypeTxt)
                        writer.write('return Promise.resolve({})');
                    }
                };
            })
        });
        prj.save();
    };
    return Program;
}());
exports.Program = Program;
