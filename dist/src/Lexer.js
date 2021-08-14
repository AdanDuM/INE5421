"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadTokens = void 0;
const Aho_1 = require("./Aho");
const Automata_1 = require("./Automata");
const SyntaxTree_1 = require("./SyntaxTree");
const File_1 = require("./utils/File");
function ReadTokens(code, regexps) {
    // Para cada ER deve ser gerado o AFD correspondente
    const AFDs = regexps.map(r => Aho_1.SyntaxTreeToAFD(SyntaxTree_1.NewSyntaxTree(`(${r.regexp})#`), `%${r.name}%`));
    // AFDs devem ser unidos
    const finalAFD = AFDs.reduce((acc, v) => Automata_1.determinizeAFND(Automata_1.unionAFDs(acc, v)));
    // Analisa o tipo de cada lexema
    const tokens = new Map();
    iterateCode(finalAFD, code, (lexema, s, p) => {
        const filtered = regexps.filter(r => s.search(`%${r.name}%`) !== -1);
        let names = [];
        filtered.forEach(r => {
            if (names.length === 0) {
                names = [r];
                return;
            }
            if (r.priority < names[0].priority) {
                names = [r];
                return;
            }
            if (r.priority === names[0].priority) {
                names = [...names, r];
                return;
            }
        });
        const regexpNames = [...(names)];
        if (regexpNames.length == 0)
            throw new Error(`Not recognized: ${lexema}`);
        if (regexpNames.length > 1)
            throw new Error(`Lexema '${lexema}' ambiguo com '${regexpNames[0].regexp} ${regexpNames[0].name}' e '${regexpNames[1].regexp} ${regexpNames[1].name}'`);
        tokens.set(p, { type: regexpNames[0].name, value: lexema });
    });
    return tokens;
}
exports.ReadTokens = ReadTokens;
function iterateCode(afd, s, fn) {
    for (let i = 0; i < s.length; i++) {
        let lexema = "";
        let j = i;
        let stop = false;
        let ret = {
            again: afd.process,
            result: null
        };
        // Vai iterando sobre os estados até que encontre um motivo em lookahead para parar,
        // ou a palavra acabe
        while (ret.again !== null && j < s.length && !stop) {
            let char = s.charAt(j);
            let lookahead = s.charAt(j + 1);
            if (char !== " ") {
                lexema = lexema + char;
                ret = ret.again(char);
            }
            j++;
            stop =
                lookahead === " "
                    || char === "*"
                    || (char === "&" && lookahead !== "&")
                    || lookahead === "(" || char === "("
                    || lookahead === ")" || char === ")"
                    || lookahead === "[" || char === "["
                    || lookahead === "]" || char === "]"
                    || lookahead === "{" || char === "{"
                    || lookahead === "}" || char === "}"
                    || lookahead === "," || char === ","
                    || lookahead === ";" || char === ";";
        }
        if (ret.again !== null) {
            ret = ret.again("");
            if (!!ret.result)
                fn(lexema, ret.result, j - lexema.length);
        }
        i = j - 1;
    }
}
const code = File_1.openCodeFile('example') || '';
const { definitions } = File_1.jsonToRegDef('regular-definitions');
const tokens = ReadTokens(code, definitions);
console.log(tokens);
