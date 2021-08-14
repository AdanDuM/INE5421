"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxTreeToAFD = exports.set2name = exports.getFollowPos = exports.getAlphabet = exports.recursiveFollowPos = exports.isSingleOp = exports.isSymbol = void 0;
const Automata_1 = require("./Automata");
const END_SYMBOL = '#';
function isSymbol(s) {
    return typeof s === 'string';
}
exports.isSymbol = isSymbol;
function isSingleOp(s) {
    return typeof s === 'object' && ['optional', 'plus', 'star'].includes(s.type);
}
exports.isSingleOp = isSingleOp;
function recursiveFollowPos(syntaxTree, f) {
    // É simbolo
    if (isSymbol(syntaxTree)) {
        const i = f.length;
        f.push({ symbol: syntaxTree, followPos: new Set() });
        return {
            nullable: false,
            firstPos: new Set([i]),
            lastPos: new Set([i]),
        };
    }
    // Operador de uma expressao apenas
    if (isSingleOp(syntaxTree)) {
        const child = recursiveFollowPos(syntaxTree.value, f);
        // Caso seja estrela ou soma, para cada elemento de lastPos, adicionar
        // todo o conjunto firstPos como followPos
        if (syntaxTree.type === 'plus' || syntaxTree.type === 'star')
            child.lastPos.forEach(v => {
                const { followPos } = f[v];
                child.firstPos.forEach(v => followPos.add(v));
            });
        return {
            nullable: syntaxTree.type === 'optional' ||
                syntaxTree.type === 'star' ||
                child.nullable,
            firstPos: child.firstPos,
            lastPos: child.lastPos,
        };
    }
    // Operador de duas expressoes
    const left = recursiveFollowPos(syntaxTree.left, f);
    const right = recursiveFollowPos(syntaxTree.right, f);
    let nullable = false;
    let firstPos = new Set();
    let lastPos = new Set();
    if (syntaxTree.type === 'or') {
        // Uniao dos dois firstPos
        left.firstPos.forEach(v => firstPos.add(v));
        right.firstPos.forEach(v => firstPos.add(v));
        // Uniao dos dois lastPos
        left.lastPos.forEach(v => lastPos.add(v));
        right.lastPos.forEach(v => lastPos.add(v));
        // Se um dos dois for anulavel
        nullable = left.nullable || right.nullable;
    } /* === 'concat' */
    else {
        // firstPos
        if (left.nullable) {
            // Uniao dos dois firstPos
            left.firstPos.forEach(v => firstPos.add(v));
            right.firstPos.forEach(v => firstPos.add(v));
        }
        else {
            firstPos = left.firstPos;
        }
        // lastPos
        if (right.nullable) {
            // Uniao dos dois lastPos
            left.lastPos.forEach(v => lastPos.add(v));
            right.lastPos.forEach(v => lastPos.add(v));
        }
        else {
            lastPos = right.lastPos;
        }
        // Ambos precisam ser anulaveis
        nullable = left.nullable && right.nullable;
        // Ajuste do followPos
        left.lastPos.forEach(v => {
            const { followPos } = f[v];
            right.firstPos.forEach(v => followPos.add(v));
        });
    }
    return { nullable, firstPos, lastPos };
}
exports.recursiveFollowPos = recursiveFollowPos;
function getAlphabet(followPos) {
    return new Set([
        ...Array.from(followPos.flatMap(v => (v.symbol !== END_SYMBOL ? v.symbol : []))),
    ]);
}
exports.getAlphabet = getAlphabet;
function getFollowPos(syntaxTree) {
    const followPos = [];
    const { firstPos, lastPos } = recursiveFollowPos(syntaxTree, followPos);
    return { followPos, firstPos };
}
exports.getFollowPos = getFollowPos;
function set2name(set) {
    const s = [...set]
        .sort()
        .map(i => i + 1).reduce((prev, curr) => `${prev}, ${curr}`, '');
    if (s.length === 0)
        return "";
    return `{${s.slice(2)}}`;
}
exports.set2name = set2name;
function SyntaxTreeToAFD(syntaxTree, nomeDoTreco) {
    const { followPos, firstPos } = getFollowPos(syntaxTree);
    const alphabet = getAlphabet(followPos);
    const initialState = set2name(firstPos);
    const Dstates = {
        [`${nomeDoTreco}_${initialState}`]: { final: false, transitions: {} },
    };
    const unmarkedStates = [firstPos];
    while (unmarkedStates.length > 0) {
        const S = unmarkedStates.pop();
        const Sname = !set2name(S) ? "M" : `${nomeDoTreco}_${set2name(S)}`;
        // para cada simbolo do alfabeto
        alphabet.forEach(a => {
            // Sendo U a uniao dos 'FollowPos(p)', onde 'p' é
            // um simbolo presente em 'S', que corresponde à 'a'
            const U = new Set();
            S.forEach(pIndex => {
                const p = followPos[pIndex].symbol;
                if (a === p)
                    followPos[pIndex].followPos.forEach(v => U.add(v));
            });
            const Uname = !set2name(U) ? "M" : `${nomeDoTreco}_${set2name(U)}`;
            if (!Dstates[Uname]) {
                Dstates[Uname] = {
                    final: [...U].some(v => followPos[v].symbol === END_SYMBOL),
                    transitions: {},
                };
                unmarkedStates.push(U);
            }
            Dstates[Sname].transitions[a] = Uname;
        });
    }
    return Automata_1.createAFD(alphabet, `${nomeDoTreco}_${initialState}`, Dstates);
}
exports.SyntaxTreeToAFD = SyntaxTreeToAFD;
