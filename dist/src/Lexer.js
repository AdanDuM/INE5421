"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadTokens = void 0;
const Aho_1 = require("./Aho");
const Automata_1 = require("./Automata");
const SyntaxTree_1 = require("./SyntaxTree");
const File_1 = require("./utils/File");
function ReadTokens(code, regexps) {
    const lexemas = code.split(/\s+/);
    const regex = Object.keys(regexps);
    // Para cada ER deve ser gerado o AFD correspondente
    const AFDs = regex.map(e => Aho_1.SyntaxTreeToAFD(SyntaxTree_1.NewSyntaxTree(`(${e})#`), regexps[e]));
    // AFDs devem ser unidos
    const finalAFD = AFDs.reduce((acc, v) => Automata_1.determinizeAFND(Automata_1.unionAFDs(acc, v)));
    // Analisa o tipo de cada lexema
    const tokens = new Map();
    lexemas.forEach((lexema, position) => {
        // Roda o AFD e ve qual foi o estado final (set tiver)
        const finalState = finalAFD.process(lexema);
        if (!finalState)
            throw new Error(`Not recognized: ${lexema}`); // Se nao tem estado final, não reconheceu
        const regexpNames = Object.values(regexps).filter(nomeDoTreco => finalState.includes(nomeDoTreco));
        if (!regexpNames)
            throw new Error(`Not recognized: ${lexema}`);
        tokens.set(position, regexpNames[0]);
    });
    console.log(tokens);
    return tokens;
}
exports.ReadTokens = ReadTokens;
const code = File_1.openCodeFile('example') || '';
const { definitions } = File_1.jsonToRegDef('regular-definitions');
ReadTokens(code, definitions);
