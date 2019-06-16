"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var path = require("path");
var Program = /** @class */ (function () {
    function Program() {
        //
    }
    Program.prototype.parseApiFile = function (pathStr) {
        var _this = this;
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
                        writer.write("return Promise.resolve(" + _this.resolveMock(resolvedReturnType) + ")");
                    }
                };
            })
        });
        prj.save();
    };
    Program.prototype.resolveMock = function (returnType) {
        var _this = this;
        if (returnType.isString()) {
            return "'any-ramdom-string'";
        }
        else if (returnType.isStringLiteral()) {
            return returnType.getText();
        }
        if (returnType.isNumber()) {
            return 100020;
        }
        else if (returnType.isNullable()) {
            return 'void';
        }
        else if (returnType.getText() === 'void') {
            return '';
        }
        else if (returnType.isBoolean()) {
            return true;
        }
        else if (returnType.isObject()) {
            debugger;
            var cdWriter_1 = this.getCdWriter();
            cdWriter_1.block(function () {
                var props = returnType.getProperties();
                for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
                    var prop = props_1[_i];
                    console.log('name:', prop.getName(), 'type:', prop.getValueDeclarationOrThrow().getType().getText());
                    cdWriter_1.write(prop.getName() + ": " + _this.resolveMock(prop.getValueDeclarationOrThrow().getType()) + ",");
                }
            });
            return cdWriter_1.toString();
        }
        else {
            return '{}';
        }
    };
    Program.prototype.getCdWriter = function () {
        return new ts_morph_1.CodeBlockWriter({
            useSingleQuote: true
        });
    };
    return Program;
}());
exports.Program = Program;
