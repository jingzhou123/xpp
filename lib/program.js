"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var path = require("path");
var fs = require("fs");
var Program = /** @class */ (function () {
    function Program() {
        //
    }
    Program.prototype.parseApiFile = function (pathStr) {
        var _this = this;
        var prj = new ts_morph_1.Project();
        var fileName = path.basename(pathStr, '.ts');
        var mockFileName = fileName + ".mock.ts";
        var mockFilePath = path.dirname(pathStr) + '/' + mockFileName;
        if (fs.existsSync(path.resolve(mockFilePath))) {
            throw new Error('file existed');
        }
        fs.copyFileSync(pathStr, mockFilePath);
        var anyApiSrc = prj.addExistingSourceFile(mockFilePath);
        var classList = anyApiSrc.getClasses();
        for (var _i = 0, classList_1 = classList; _i < classList_1.length; _i++) {
            var classItem = classList_1[_i];
            console.log('class:', classItem.getName());
        }
        if (!classList.length) {
            throw new Error('not found any class');
        }
        if (classList.length > 1) {
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
        var methods = onlyClass.getMethods();
        var _loop_1 = function (method) {
            method.setBodyText(function (writer) {
                var returnTypeTxt = method.getReturnTypeNodeOrThrow().getText();
                if (!returnTypeTxt.match(/^Promise<[^>]+>/)) {
                    throw new Error('return type must be Promise');
                }
                // console.log('return type:', returnTypeTxt)
                var resolvedReturnType = method.getReturnType().getTypeArguments()[0];
                console.log('resolved return type:', resolvedReturnType.getText());
                writer.write("return Promise.resolve(" + _this.resolveMock(resolvedReturnType) + ")");
            });
        };
        for (var _a = 0, methods_1 = methods; _a < methods_1.length; _a++) {
            var method = methods_1[_a];
            _loop_1(method);
        }
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
        else if (returnType.isObject() || returnType.isInterface()) {
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
