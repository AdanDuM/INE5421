import { SyntaxTreeToAFD } from './Aho';
import { AFD, determinizeAFND, Runner, unionAFDs } from './Automata';
import { NewSyntaxTree } from './SyntaxTree';

type RegDefs = { regexp: string, name: string, priority: number }[]

export function ReadTokens(code: string, regexps: RegDefs): Map<number, string> {
  // Para cada ER deve ser gerado o AFD correspondente
  const AFDs = regexps.map(r => SyntaxTreeToAFD(NewSyntaxTree(`(${r.regexp})#`), `%${r.name}%`))

  // AFDs devem ser unidos
  const finalAFD = AFDs.reduce((acc, v) => determinizeAFND(unionAFDs(acc, v)))

  // Analisa o tipo de cada lexema
  const tokens = new Map<number, string>()
  iterateCode(finalAFD, code, (lexema, s, p) => {
    const filtered = regexps.filter(r => s.search(`%${r.name}%`) !== -1)
    let names: RegDefs = []
    filtered.forEach(r => {
      if (names.length === 0) {
        names = [r]
        return
      }
      if (r.priority < names[0].priority) {
        names = [r]
        return
      }
      if (r.priority === names[0].priority) {
        names = [...names, r]
        return
      }
    })

    const regexpNames = [...(names)]
    if (regexpNames.length == 0)
      throw new Error(`Not recognized: ${lexema}`)
    if (regexpNames.length > 1)
      throw new Error(`Lexema '${lexema}' ambiguo com '${regexpNames[0].regexp} ${regexpNames[0].name}' e '${regexpNames[1].regexp} ${regexpNames[1].name}'`)
    
    tokens.set(p, regexpNames[0].name)
  })

  return tokens
}

function iterateCode(afd: AFD, s: string, fn: (l: string, s: string, p: number) => void) {
  for (let i = 0; i < s.length; i++) {
    let lexema = ""
    let j = i
    let stop = false
    let ret: { again: Runner | null, result: string | null } = {
      again: afd.process,
      result: null
    }

    // Vai iterando sobre os estados até que encontre um motivo em lookahead para parar,
    // ou a palavra acabe
    while(ret.again !== null && j < s.length && !stop) {
      let char = s.charAt(j)
      let lookahead = s.charAt(j+1)
      if (char !== " ") {
        lexema = lexema + char
        ret = ret.again(char)
      }

      j++
      stop = 
            lookahead === " "
        || lookahead === "(" || char === "("
        || lookahead === "(" || char === "("
        || lookahead === "{" || char === "{"
        || lookahead === "}" || char === "}"
        || lookahead === "," || char === ","
        || lookahead === ";" || char === ";"
    }
    if (ret.again !== null) {
      ret = ret.again("")
      if (!!ret.result)
        fn(lexema, ret.result, j - lexema.length)
    }
    i = j - 1
  }
}
