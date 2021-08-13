import { SyntaxTreeToAFD } from './Aho';
import { determinizeAFND, unionAFDs } from './Automata';
import { NewSyntaxTree } from './SyntaxTree';

export type RegDef = {
  [k: string]: string;
};

export function ReadTokens(code: string, regexps: RegDef): Map<number, string> {
  const lexemas = code.split(/\s+/);
  const regex = Object.keys(regexps);

  // Para cada ER deve ser gerado o AFD correspondente
  const AFDs = regex.map(e =>
    SyntaxTreeToAFD(NewSyntaxTree(`(${e})#`), regexps[e]),
  );

  // AFDs devem ser unidos
  const finalAFD = AFDs.reduce((acc, v) => determinizeAFND(unionAFDs(acc, v)));

  // Analisa o tipo de cada lexema
  const tokens = new Map<number, string>();
  lexemas.forEach((lexema, position) => {
    // Roda o AFD e ve qual foi o estado final (set tiver)
    const finalState = finalAFD.process(lexema);
    if (!finalState) throw new Error(`Not recognized: ${lexema}`); // Se nao tem estado final, não reconheceu

    const regexpNames = Object.values(regexps).filter(nomeDoTreco =>
      finalState.includes(nomeDoTreco),
    );
    if (!regexpNames) throw new Error(`Not recognized: ${lexema}`);

    tokens.set(position, regexpNames[0]);
  });

  return tokens;
}
