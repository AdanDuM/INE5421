import { isUuid } from 'uuidv4';

import { openCodeFile } from '../src/utils/File';
import {
  openFile,
  jsonToAutomaton,
  jsonToRegex,
  createSimpleDFA,
  createDFA,
  epsilonClosure,
  // toDFA,
  merge,
  concat,
  kleeneStar,
  kleenePlus,
  runDFA,
} from '../src/Automaton';

import { NewSyntaxTree } from '../src/SyntaxTree';
import SyntaxTreeToAFD from '../src/Aho';
import {
  AFD,
  AFND,
  runAFD,
  epsilonClosureM,
  unionAFDs,
  determinizeAFND,
} from '../src/Automata';
import { lexer } from '../src/Lexer';

describe('Lexical Analysis', () => {
  it('should load json file', () => {
    const file = openFile('example');
    expect(file).toBe(`{"test": "some text"}\n`);
  });

  // it('should load code file', () => {
  //   const file = openCodeFile('example');
  //   expect(file).toBe(`int n = 0;\nbool show = true;\nstring message = '';\n\ndo\n  n = n + 1\nwhile n < 100\n\nif show == true then\n  message = n\n`);
  // });

  it('should load dfa from json', () => {
    const automaton = jsonToAutomaton('dfa-1');
    expect(automaton).toStrictEqual({
      states: ['q0', 'q1', 'q2', 'q3'],
      alphabet: ['a', 'b', 'c'],
      transitions: [
        {
          origin: 'q0',
          symbol: 'a',
          destination: 'q1',
        },
        {
          origin: 'q0',
          symbol: 'b',
          destination: 'q2',
        },
        {
          origin: 'q0',
          symbol: 'c',
          destination: 'q3',
        },
        {
          origin: 'q1',
          symbol: 'b',
          destination: 'q2',
        },
        {
          origin: 'q1',
          symbol: 'c',
          destination: 'q3',
        },
        {
          origin: 'q2',
          symbol: 'a',
          destination: 'q1',
        },
        {
          origin: 'q2',
          symbol: 'c',
          destination: 'q3',
        },
        {
          origin: 'q3',
          symbol: 'c',
          destination: 'q3',
        },
      ],
      initial: 'q0',
      finals: ['q3'],
    });
  });

  it('should load regex from json', () => {
    const regex = jsonToRegex('regular-expression-1');
    expect(regex).toStrictEqual({
      expression: '(a|b)*abb',
    });
  });

  it('should create a simple dfa from a symbol containing two states', () => {
    const { states, alphabet, transitions, initial, finals } =
      createSimpleDFA('a');

    expect(states.map(s => isUuid(s))).toEqual([true, true]);
    expect(alphabet).toContainEqual('a');
    expect(
      transitions.map(t => isUuid(t.destination) && isUuid(t.origin)),
    ).toEqual([true]);
    expect(isUuid(initial)).toBe(true);
    expect(finals.map(f => isUuid(f))).toEqual([true]);
  });

  it('should create a new dfa from json dfa', () => {
    const jsonAutomaton = jsonToAutomaton('dfa-1');

    const { states, alphabet, transitions, initial, finals } =
      createDFA(jsonAutomaton);

    expect(states.map(s => isUuid(s))).toEqual([true, true, true, true]);
    expect(alphabet).toEqual(['a', 'b', 'c']);
    expect(
      transitions.map(t => isUuid(t.destination) && isUuid(t.origin)),
    ).toEqual([true, true, true, true, true, true, true, true]);
    expect(isUuid(initial)).toBe(true);
    expect(finals.map(f => isUuid(f))).toEqual([true]);
  });

  // it('should compute the epsilon closure of a nfa', () => {
  //   const automatonA = createSimpleDFA('a');
  //   const automatonB = createSimpleDFA('b');

  //   const nfa = merge(automatonA, automatonB);
  //   const { states, alphabet, transitions, initial, finals } = nfa;
  //   const set = new Set<string>();
  //   epsilonClosure(nfa.initial, nfa, set);
  //   // expect(set).toBe('');
  //   expect(nfa).toBe('');
  //   expect(runDFA('abac', nfa, nfa.initial)).toBe(true);
  // });

  // it('should compute the epsilon closure M of a nfa', () => {
  //   const automatonA = createSimpleDFA('a');
  //   const automatonB = createSimpleDFA('b');

  //   const { states, alphabet, transitions, initial, finals } = merge(
  //     automatonA,
  //     automatonB,
  //   );

  //   expect(runDFA('abac', automatonA, automatonA.initial)).toBe(true);
  // });

  // it('should convert from regular expression to dfa', () => {
  //   expect(1 + 1).toBe(2);
  // });

  it('should merge two fa by ε-transition', () => {
    const automatonA = createSimpleDFA('a');
    const automatonB = createSimpleDFA('b');

    const { states, alphabet, transitions, initial, finals } = merge(
      automatonA,
      automatonB,
    );

    expect(states).toHaveLength(6);
    expect(alphabet).toEqual(new Set(['&', 'a', 'b']));
    expect(transitions).toHaveLength(6);
    expect(finals).toHaveLength(1);
  });

  it('should concat two fa by ε-transition', () => {
    const automatonA = createSimpleDFA('a');
    const automatonB = createSimpleDFA('b');

    const { states, alphabet, transitions, initial, finals } = concat(
      automatonA,
      automatonB,
    );

    expect(states).toHaveLength(4);
    expect(alphabet).toEqual(new Set(['&', 'a', 'b']));
    expect(transitions).toHaveLength(3);
    expect(finals).toHaveLength(1);
  });

  it('should have kleene star fa by ε-transition', () => {
    const automatonA = createSimpleDFA('a');

    const { states, alphabet, transitions, initial, finals } =
      kleeneStar(automatonA);

    expect(states).toHaveLength(4);
    expect(alphabet).toEqual(new Set(['&', 'a']));
    expect(transitions).toHaveLength(5);
    expect(finals).toHaveLength(1);
  });

  it('should have kleene plus fa by ε-transition', () => {
    const automatonA = createSimpleDFA('a');

    const { states, alphabet, transitions, initial, finals } =
      kleenePlus(automatonA);

    expect(states).toHaveLength(4);
    expect(alphabet).toEqual(new Set(['&', 'a']));
    expect(transitions).toHaveLength(3);
    expect(finals).toHaveLength(1);
  });

  // it('should convert nfa to dfa', () => {
  //   const regex = [
  //     '(0|1|2|3|4|5|6|7|8|9)+',
  //     '(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)+',
  //     'while',
  //     'if',
  //   ];
  //   const nfa1: AFND = SyntaxTreeToAFD(NewSyntaxTree('(0|1|2|3|4|5|6|7|8|9)+'));
  //   const nfa2 = SyntaxTreeToAFD(
  //     NewSyntaxTree('(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)+'),
  //   );
  //   const nfa3 = SyntaxTreeToAFD(NewSyntaxTree('while'));
  //   const nfa4 = SyntaxTreeToAFD(NewSyntaxTree('if'));
  //   determinizeAFND(nfa1);
  //   expect(1 + 1).toBe(2);
  // });

  // it('should run a afd', () => {
  //   const code = 'while';
  //   const nfa1 = SyntaxTreeToAFD(NewSyntaxTree(code));
  //   expect(runAFD(code, nfa1.initialState, nfa1.states)).toBe('2');
  // });

  // it('should successfully run a dfa', () => {
  //   const automaton = jsonToAutomaton('dfa-1');
  //   expect(runDFA('abac', automaton, automaton.initial)).toBe(true);
  // });

  // it('should fail to run a dfa', () => {
  //   const automaton = jsonToAutomaton('dfa-1');
  //   expect(runDFA('aba', automaton, automaton.initial)).toBe(false);
  // });

  // it('should build symbol table', () => {
  //   const code = 'while 15 > 0';
  //   const tokens = lexer(code);
  //   expect(tokens).toBe('2');
  // });

  it('should build symbol table', () => {
    const code = openCodeFile('example') || '';
    const tokens = lexer(code);
    expect(tokens).toBe('2');
  });
});
