"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = require("../src/Lexer");
const File_1 = require("../src/utils/File");
it('TESTE', () => {
    const code = File_1.openCodeFile('example') || '';
    // console.log(code)
    const regex = File_1.jsonToRegDef('regular-definitions');
    // console.log(regex)
    const tokens = Lexer_1.ReadTokens(code, regex.definitions);
    console.log(tokens);
});
