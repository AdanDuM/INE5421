import { isUuid } from 'uuidv4';

import {
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
} from '../src/Automaton';

describe('Lexical Analysis', () => {
  it('should load json file', () => {
    const file = openFile('example');
    expect(file).toBe(`{"test": "some text"}\n`);
  });

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
  //   expect(1 + 1).toBe(2);
  // });

  // it('should build symbol table', () => {
  //   expect(1 + 1).toBe(2);
  // });
});
