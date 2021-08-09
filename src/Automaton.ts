import fs from 'fs';
import path from 'path';
import { uuid } from 'uuidv4';

type State = string;

interface Transition {
  origin: State;
  symbol: string;
  destination: State;
}

interface Automaton {
  states: Array<State>;
  alphabet: Set<string>;
  transitions: Array<Transition>;
  initial: State;
  finals: Array<State>;
}

interface RegEx {
  expression: string;
}

type SyntaxTreeNode = {
  type: 'concat' | 'star' | 'plus' | 'or' | 'optional';
  // root: SyntaxTreeNode | null;
  leafs: Array<SyntaxTreeNode | SyntaxTreeLeafNode>;
};

type SyntaxTreeLeafNode = {
  // root: SyntaxTreeNode | null;
  value: string;
};

const operatorSymbols: { [k: string]: SyntaxTreeNode['type'] } = {
  '.': 'concat',
  '*': 'star',
  '+': 'plus',
  '|': 'or',
  '?': 'optional',
};

const openFile = (file: string) => {
  try {
    const pathToFile = path.join(__dirname, '..', 'json', `${file}.json`);
    return fs.readFileSync(pathToFile, 'utf8');
  } catch (err) {
    console.error(err);
  }
};

/**
 * Load an automaton from a file
 * @param json A valid json file located in the json folder.
 * @returns An Automaton.
 */
const jsonToAutomaton = (json: string): Automaton => {
  const jsonFA = openFile(json);

  return JSON.parse(jsonFA || '');
};

const jsonToRegex = (json: string): RegEx => {
  const jsonRegEx = openFile(json);
  return jsonRegEx ? JSON.parse(jsonRegEx) : '';
};

/**
 * Create a transition
 * @param origin An State.
 * @param symbol An string.
 * @param destination An State.
 * @returns A Transition.
 */
const createTransition = (
  origin: State,
  symbol: string,
  destination: State,
): Transition => {
  return {
    origin,
    symbol,
    destination,
  };
};

/**
 * Convert a NFA to a DFA
 * @param nfa An nondeterministic finite automaton of type Automaton.
 * @returns An Automaton.
 */
const createSimpleDFA = (symbol: string): Automaton => {
  const initial = uuid();
  const finals = [uuid()];
  const states = finals.concat(initial);
  const alphabet = new Set([symbol]);
  const transitions = [createTransition(initial, symbol, finals[0])];

  const automaton = {
    states,
    alphabet,
    transitions,
    initial,
    finals,
  };

  return automaton;
};

/**
 * Create a valid DFA from json
 * @param a An Automaton representation loaded from a json file.
 * @returns An Automaton.
 */
const createDFA = (a: Automaton): Automaton => {
  const statesMap = new Map();

  a.states.map(state => statesMap.set(state, uuid()));

  const states = Array.from(statesMap.values());
  const transitions = a.transitions.map(transition => {
    const origin = statesMap.get(transition.origin);
    const destination = statesMap.get(transition.destination);

    return createTransition(origin, transition.symbol, destination)
  });
  const initial = statesMap.get(a.initial);
  const finals = a.finals.map(final => statesMap.get(final));

  const automaton = {
    states,
    alphabet: a.alphabet,
    transitions,
    initial,
    finals,
  };

  return automaton;
};

/**
 * Convert a NFA to a DFA
 * @param nfa An nondeterministic finite automaton of type Automaton.
 * @returns An Automaton.
 */
const toDFA = (nfa: Automaton): Automaton => {
  // validate
  return nfa;
};

/**
 * Merge two different automata into a new automaton by ε-transition
 * @param a An Automaton.
 * @param b An Automaton.
 * @returns An Automaton.
 */
const merge = (a: Automaton, b: Automaton): Automaton => {
  const initial = uuid();
  const finals = [uuid()];

  const states = [initial, ...finals, ...a.states, ...b.states];
  const alphabet = new Set([
    '&',
    ...Array.from(a.alphabet),
    ...Array.from(b.alphabet),
  ]);
  const transitions = a.transitions.concat(b.transitions);

  transitions.push(createTransition(initial, '&', a.initial));
  transitions.push(createTransition(initial, '&', b.initial));

  a.finals.concat(b.finals).forEach(state => {
    transitions.push(createTransition(state, '&', finals[0]));
  });

  const automaton = {
    states,
    alphabet,
    transitions,
    initial,
    finals,
  };

  return automaton;
};

/**
 * Concat two different automata into a new automaton by ε-transition
 * @param a An Automaton.
 * @param b An Automaton.
 * @returns An Automaton.
 */
const concat = (a: Automaton, b: Automaton): Automaton => {
  const { initial } = a;
  const { finals } = b;

  const states = [...a.states, ...b.states];
  const alphabet = new Set([
    '&',
    ...Array.from(a.alphabet),
    ...Array.from(b.alphabet),
  ]);
  const transitions = a.transitions.concat(b.transitions);

  a.finals.forEach(state => {
    transitions.push(createTransition(state, '&', b.initial));
  });

  const automaton = {
    states,
    alphabet,
    transitions,
    initial,
    finals,
  };

  return automaton;
};

/**
 * Concat two different automata into a new automaton by ε-transition
 * @param a An Automaton.
 * @param b An Automaton.
 * @returns An Automaton.
 */
const kleeneStar = (dfa: Automaton): Automaton => {
  const initial = uuid();
  const finals = [uuid()];

  const states = [initial, ...finals, ...dfa.states];
  const alphabet = dfa.alphabet.add('&');
  const { transitions } = dfa;

  transitions.push(createTransition(initial, '&', dfa.initial));
  transitions.push(createTransition(initial, '&', finals[0]));

  dfa.finals.forEach(state => {
    transitions.push(createTransition(state, '&', finals[0]));
  });

  transitions.push(createTransition(finals[0], '&', dfa.initial));

  const automaton = {
    states,
    alphabet,
    transitions,
    initial,
    finals,
  };

  return automaton;
};

/**
 * Concat two different automata into a new automaton by ε-transition
 * @param a An Automaton.
 * @param b An Automaton.
 * @returns An Automaton.
 */
const kleenePlus = (dfa: Automaton): Automaton => {
  const initial = uuid();
  const finals = [uuid()];

  const states = [initial, ...finals, ...dfa.states];
  const alphabet = dfa.alphabet.add('&');
  const { transitions } = dfa;

  transitions.push(createTransition(initial, '&', dfa.initial));

  dfa.finals.forEach(state => {
    transitions.push(createTransition(state, '&', finals[0]));
  });

  const automaton = {
    states,
    alphabet,
    transitions,
    initial,
    finals,
  };

  return automaton;
};

/**
 * Convert a regular expression into a DFA
 * @param regex An RegEx.
 * @returns An Automaton.
 */
const createSyntaxTree = (
  expression: string,
  root: SyntaxTreeNode | null,
): SyntaxTreeNode | SyntaxTreeLeafNode => {
  if (expression.length === 1) {
    const subTree: SyntaxTreeLeafNode = {
      // root,
      value: expression,
    };

    return subTree;
  }

  const last = expression.slice(-1);
  const antepenultimate = expression.slice(-2, -1);
  const subExpression = expression.slice(0, -2);

  console.log(
    'TESTE',
    'sub',
    subExpression,
    'last',
    last,
    'antepe',
    antepenultimate,
    operatorSymbols[last],
    operatorSymbols[antepenultimate],
  );
  if (operatorSymbols[last]) {
    const subTree: SyntaxTreeNode = {
      // root,
      type: operatorSymbols[last],
      leafs: [],
    };

    if (subExpression && subExpression.length > 1) {
      subTree.leafs.push(createSyntaxTree(subExpression, subTree));
    }
    subTree.leafs.push(createSyntaxTree(antepenultimate, subTree));

    return subTree;
  }

  const subTree: SyntaxTreeNode = {
    // root,
    type: operatorSymbols[antepenultimate],
    leafs: [],
  };

  if (subExpression && subExpression.length > 1) {
    subTree.leafs.push(createSyntaxTree(subExpression, subTree));
  }
  subTree.leafs.push(createSyntaxTree(last, subTree));

  return subTree;
};

/**
 * Choose operation
 * @param operation An RegEx.
 * @returns An Automaton.
 */
const chooseOperation = (operation: string) => {
  switch (operation) {
    case 'star':
      return kleeneStar;
    case 'plus':
      return kleenePlus;
    // case 'optional':
    //   return optional;
    case 'concat':
      return concat;
    case 'or':
      return concat;
    default:
      return undefined;
  }
};

/**
 * Convert a regular expression into a DFA
 * @param regex An RegEx.
 * @returns An Automaton.
 */
// const regularExpressionToAutomaton = (regex: RegEx): Automaton => {
//   // normalize
//   const { expression } = regex;

//   // (a|b)*abb#
//   // remove espaço em branco, adiciona concatenação implicita
//   let exp = regex.expression.replace(/\s+/g, '');
//   exp = `${exp}#`;

//   const tree = createSyntaxTree(exp, null);

// traverse tree and perform operations

//   const automaton = {
//     states,
//     alphabet,
//     transitions,
//     initial,
//     finals,
//   };

//   return automaton;
// };

export {
  openFile,
  jsonToAutomaton,
  jsonToRegex,
  createSimpleDFA,
  createDFA,
  toDFA,
  merge,
  concat,
  kleeneStar,
  kleenePlus,
  createSyntaxTree,
  // regularExpressionToAutomaton,
};
