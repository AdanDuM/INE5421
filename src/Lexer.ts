import { SyntaxTreeToAFD } from './Aho';
import { determinizeAFND, unionAFDs } from './Automata';
import { NewSyntaxTree } from './SyntaxTree';

type RegDef = {
  [k: string]: string
}

export function ReadTokens(code: string, regexps: RegDef): Map<number, string> {
  const lexemas = code.split(/\s+/)
  const regex = Object.keys(regexps)

  // Para cada ER deve ser gerado o AFD correspondente
  const AFDs = regex.map(e => SyntaxTreeToAFD(NewSyntaxTree(`(${e})#`), regexps[e]))

  // AFDs devem ser unidos
  const finalAFD = AFDs.reduce((acc, v) => determinizeAFND(unionAFDs(acc, v)))

  // Analisa o tipo de cada lexema
  const tokens = new Map<number, string>()
  lexemas.forEach((lexema, position) => {
    // Roda o AFD e ve qual foi o estado final (set tiver)
    const finalState = finalAFD.process(lexema)
    if (!finalState)
      throw new Error(`Not recognized: ${lexema}`) // Se nao tem estado final, não reconheceu

    const regexpNames = [
      ...(new Set(Object
        .values(regexps)
        .filter(nomeDoTreco => finalState.search(nomeDoTreco) !== -1)))
    ]
    if (regexpNames.length == 0)
      throw new Error(`Not recognized: ${lexema}`)
    if (regexpNames.length > 1)
      throw new Error(`Ambiguidade com '${regexpNames[0]}' e '${regexpNames[1]}'`)
    
    tokens.set(position, regexpNames[0])
  })

  return tokens
}
