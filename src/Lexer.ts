import SyntaxTreeToAFD from './Aho';
import { AFD, determinizeAFND, runAFD, unionAFDs } from './Automata';
import { jsonToRegDef } from './utils/File';
import { NewSyntaxTree } from './SyntaxTree';

/**
 * Convert a regular expression into a DFA
 * @param regex An RegEx.
 * @returns An Automaton.
 */
const lexer = (code: string) => {
  // A interface de execução deve permitir a entrada de um texto fonte
  const lexemas = code.split(/\s+/); // divide o codigo em possiveis lexemas
  const regex = Object.keys(jsonToRegDef('regular-definitions').definitions);

  // Para cada ER deve ser gerado o AFD corresponde
  const dfas = regex.map(expression =>
    SyntaxTreeToAFD(NewSyntaxTree(expression)),
  );

  // Os AFD devem ser unidos
  const reducer = (accumulator: AFD, currentValue: AFD) =>
    determinizeAFND(unionAFDs(accumulator, currentValue));

  // O AFND resultante deve ser determinizado
  const nfaFinal = dfas.reduce(reducer);

  const tokens = new Map<number, string>();
  console.log('TESTE', tokens);
  // O texto fonte será analisado e deve gerar um arquivo de saída com todos os tokes encontrados.
  lexemas.forEach((lexema, position) =>
    runAFD(lexema, nfaFinal.initialState, nfaFinal.states)
      ? tokens.set(position, '')
      : '',
  );

  return tokens;
};

export { lexer };
