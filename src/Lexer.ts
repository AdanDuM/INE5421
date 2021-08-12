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
  const { definitions } = jsonToRegDef('regular-definitions');
  const regex = Object.keys(definitions);

  // Para cada ER deve ser gerado o AFD corresponde
  const dfas = regex.map(expression =>
    SyntaxTreeToAFD(NewSyntaxTree(expression), definitions[expression]),
  );

  // Os AFD devem ser unidos
  const reducer = (accumulator: AFD, currentValue: AFD) =>
    determinizeAFND(unionAFDs(accumulator, currentValue));

  // O AFND resultante deve ser determinizado
  const afdFinal = dfas.reduce(reducer);

  const tokens = new Map<number, string>();
  // O texto fonte será analisado e deve gerar um arquivo de saída com todos os tokes encontrados.
  lexemas.forEach((lexema, position) =>
    afdFinal.process(lexema) ? tokens.set(position, '') : '',
  );
  console.log(
    'TESTE',
    tokens,
    dfas,
    dfas[2],
    runAFD(';', dfas[0].initialState, dfas[0].states),
  );

  return tokens;
};

export { lexer };
