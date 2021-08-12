type Deterministic = string
type NonDeterministic = string[]
type State<T extends string | string[]> = {
  final: boolean
  transitions: {
    [symbol: string]: T
  }
}

type AFD = AF<Deterministic>
type AFND = AF<NonDeterministic>
type AF<T extends Deterministic | NonDeterministic> = {
  alphabet: Set<string>
  initialState: string
  states: {
    [name: string]: State<T>
  }
  process: (input: string) => string | null
}

function runAFD(input: string, currentState: string, states: AFD['states']): string | null {
  if (!currentState || !states[currentState])
    // Estado atual inválido (morto)
    return null
  if (input.length === 0)
    // Entrada acabou, verifica estado atual (AFD não possui transição por epsilon)
    return states[currentState].final ? currentState : null

  const transitions = states[currentState].transitions
  if (!transitions)
    // Estado atual não possui transições saindo (iria p/ morto)
    return null

  // Chama recursivamente com novo estado e novo input (agora sem
  // o simbolo lido nesta iteração)
  const symbol = input.charAt(0)
  const nextState = transitions[symbol]
  return runAFD(input.slice(1), nextState, states)
}

function runAFND(input: string, currentState: string, states: AFND['states']): string | null {
  if (!currentState || !states[currentState])
    // Estado atual inválido (morto)
    return null

  const transitions = states[currentState].transitions
  if (!transitions)
    // Se nao existem transições a partir deste estado, então
    // so é true se a entrada acabou e o estado atual é final
    return input.length == 0 && states[currentState].final ? currentState : null

  // Se existirem transições por epsilon, itera recursivamente,
  // sem alterar a entrada, ate que alguma retorne true (se retornar)
  const epsilonTransitions = transitions[''] || []
  const abc = epsilonTransitions.filter(nextState => runAFND(input, nextState, states))
  if (abc.length > 0) return abc[0]

  if (input.length === 0)
    // A entrada acabou e transições por epsilon já foram calculadas,
    // so verifica se o estado atual é final
    return states[currentState].final ? currentState : null

  // Usa o simbolo para descobrir o(s) proximo(s) estado(s),
  // chamando recursivamente com o input/estado atualizado,
  // parando no primeiro true (retornando false caso contrário)
  const symbol = input.charAt(0)
  const nextStates = transitions[symbol] || []
  const abc2 = nextStates.filter(nextState => runAFND(input.slice(1), nextState, states))
  return abc2.length > 0 ? abc2[0] : null
}

function createAFD(alphabet: Set<string>, initialState: string, states: AFD['states']): AFD {
  return {
    alphabet,
    initialState,
    states,
    process: input => runAFD(input, initialState, states)
  }
}

function unionAFDs(a1: AFD, a2: AFD): AFND {
  const newStates: AFND['states'] = {
    // Cria um estado inicial novo que transita por epsilon para
    // os estados iniciais de a1 e a2 (que deixam de ser iniciais)
    S: {
      final: false,
      transitions: {
        '': [`a1_${a1.initialState}`, `a2_${a2.initialState}`]
      }
    },

    // Cria um estado morto
    M: {
      final: false,
      transitions: {},
    },

    // Cria um unico estado final, que vai receber transições por
    // epsilon a partir dos estados finais de a1 e a2 (que deixam de ser finais)
    F: {
      final: true,
      transitions: {}
    }
  }

  // Para cada estado de a1, cria um estado correspondente no novo AFND
  Object.getOwnPropertyNames(a1.states).forEach(state => {
    // Ignora o estado morto
    if (state === "M")
      return

    newStates[`a1_${state}`] = {
      final: false, // nunca finais
      transitions: {}
    }
    Object.getOwnPropertyNames(a1.states[state].transitions).forEach(symbol => {
      // Copia cada uma das transições
      if (a1.states[state].transitions[symbol] === "M")
        newStates[`a1_${state}`].transitions[symbol] = ["M"]
      else
        newStates[`a1_${state}`].transitions[symbol] = [`a1_${a1.states[state].transitions[symbol]}`]
    })
    if (a1.states[state].final)
        // Se o estado atual era final, deve ser incluída uma transição por epsilon
        newStates[`a1_${state}`].transitions[''] = ['F']
  })
  // Para cada estado de a2, cria um estado correspondente no novo AFND
  Object.getOwnPropertyNames(a2.states).forEach(state => {
    // Ignora o estado morto
    if (state === "M")
      return

    newStates[`a2_${state}`] = {
      final: false, // nunca finais
      transitions: {}
    }
    Object.getOwnPropertyNames(a2.states[state].transitions).forEach(symbol => {
      // Copia cada uma das transições
      if (a2.states[state].transitions[symbol] === "M")
        newStates[`a2_${state}`].transitions[symbol] = ["M"]
      else
        newStates[`a2_${state}`].transitions[symbol] = [`a2_${a2.states[state].transitions[symbol]}`]
    })
    if (a2.states[state].final)
        // Se o estado atual era final, deve ser incluída uma transição por epsilon
        newStates[`a2_${state}`].transitions[''] = ['F']
  })

  // Faz a uniao dos dois alfabetos
  const alphabet = new Set<string>()
  a1.alphabet.forEach(symbol => alphabet.add(symbol))
  a2.alphabet.forEach(symbol => alphabet.add(symbol))
  
  return {
    alphabet,
    initialState: 'S',
    states: newStates,
    process: input => runAFND(input, 'S', newStates)
  }
}

function epsilonClosure(stateName: string, states: AFND['states'], set: Set<string>) {
  set.add(stateName)
  const state = states[stateName]

  if (!state.transitions)
    // Se nao tem transições no estado, é vazio
    return
  const epsilonTransitions = state.transitions['']
  if (!epsilonTransitions)
    // Se nao possui transição por epsilon, é vazio
    return

  // Adicionar cada proximo estado ao conjunto e calcular os
  // epsilon transições recursivamente
  epsilonTransitions.forEach(nextState => {
    set.add(nextState)
    epsilonClosure(nextState, states, set)
  })
}

function set2name_2(set: Set<string>): string {
  const s = [...set].sort().reduce((prev, curr) => `${prev}, ${curr}`, '')
  return `{${s.slice(2)}}`
}

function stateTransitions(statesSet: Set<string>, closures: Map<string, Set<string>>, afnd: AFND, afdStates: AFD['states']) {
  const newStateName = set2name_2(statesSet)
  if (!!afdStates[newStateName])
    // Caso o estado atual ja exista, nao tem necessidade de
    // construir novamente
    return

  // Adiciona o estado criado para o AFD antes do loop, para evitar loops infinitos
  afdStates[newStateName] = {
    // Se algum dos estados que compoe o estado atual forem finais, entao true
    final: [...statesSet].some(stateName => afnd.states[stateName].final),

    // Deixa vazio para preencher depois do loop abaixo
    transitions: {}
  }

  // É necessário calcular as transições para cada um dos símbolos do
  // alfabeto. Para isso, itera sobre o alfabeto
  const newStateTransitions = [...afnd.alphabet].map(symbol => {
    // Cada estado que compoe o estado sendo criado atualmente
    // possui suas proprias transições para o simbolo atual, entao
    // usaremos um conjunto para armazenar isso
    const nextStates = new Set<string>()

    // Para cada estado que compoe o estado atual, verifica para quem
    // ele transita com o simbolo atual
    statesSet.forEach(stateName => {
      const state = afnd.states[stateName]
      if (!state.transitions)
        // Caso o estado nao possua nenhuma transição, ignore
        return
      const transitsTo = state.transitions[symbol]
      if (!transitsTo)
        // Caso o estado nao possua transição com o simbolo atual, ignore
        return

      // Adiciona cada uma das transições no conjunto
      transitsTo.forEach(nextState => {
        nextStates.add(nextState)
        // Adiciona tambem o conjunto epsilon fecho do proximo estado
        closures.get(nextState).forEach(byEpsilonNextState => nextStates.add(byEpsilonNextState))
      })
    })

    if (nextStates.size == 0)
      // Retorna vazio caso não existam transições para o simbolo atual
      return {}

    // Para este simbolo ja temos o estado para o qual transitar, agora
    // chamamos recursivamente essa mesma função para construi-lo
    stateTransitions(nextStates, closures, afnd, afdStates)

    // Finalmente, gera a label
    return { [`${symbol}`]: set2name_2(nextStates) }
  })

  // Junta todas as transições em um objeto so com o reduce
  afdStates[newStateName].transitions = newStateTransitions.reduce((prev, curr) => ({ ...prev, ...curr }), {})
}

function determinizeAFND(afnd: AFND): AFD {
  if (!afnd || !afnd.states || !afnd.initialState || !afnd.alphabet) return null

  // Calcula o fecho de cada um dos estados
  const epsilonClosures: Map<string, Set<string>> = new Map()
  Object.getOwnPropertyNames(afnd.states).forEach(stateName => {
    const statesSet = new Set<string>()
    epsilonClosure(stateName, afnd.states, statesSet)
    epsilonClosures.set(stateName, statesSet)
  })

  // Calculate the AFD states
  const afdStates: AFD['states'] = {}
  stateTransitions(epsilonClosures.get(afnd.initialState) as Set<string>, epsilonClosures, afnd, afdStates)
  return createAFD(afnd.alphabet, set2name_2(epsilonClosures.get(afnd.initialState) as Set<string>), afdStates)
}
