import Parser from '../src/Parser';
import Grammar from '../src/Grammar';
import { openJsonFile, jsonToGrammar } from '../src/utils/File';

describe('Syntactic Analysis', () => {
  // it('should create context free grammar', () => {
  //   const cfg = {
  //     nonterminal: ['S', 'A', 'B'],
  //     terminal: ['a', 'b', 'c'],
  //     productions: {
  //       S: ['&', 'A', 'B'],
  //       A: ['a'],
  //       B: ['b'],
  //     },
  //     start: 'S',
  //   };
  //   expect(cfg).toBe(cfg);
  //   // eslint-disable-next-line dot-notation
  //   expect(cfg.productions['S']).toStrictEqual(['&', 'A', 'B']);
  // });

  // it('should create context free grammar from json file', () => {
  //   const jsonGrammar = jsonToGrammar('cf-grammar-1');
  //   const grammar = createGrammar(jsonGrammar);
  //   const cfg = {
  //     nonterminal: ['S', 'A', 'B'],
  //     terminal: ['a', 'b', 'c'],
  //     productions: {
  //       S: ['Ab', 'ABc'],
  //       A: ['aA', '&'],
  //       B: ['bB', 'Ad', '&'],
  //     },
  //     start: 'S',
  //   };
  //   expect(grammar).toStrictEqual(cfg);
  // });

  // it('should have direct nondeterminism', () => {
  //   const productions = new Map();
  //   productions.set('S', ['bcD', 'bBcd', 'bcd']);
  //   productions.set('B', ['bB', 'b']);
  //   productions.set('D', ['dD', 'd']);
  //   const cfg = {
  //     nonterminals: ['S', 'B', 'D'],
  //     terminals: ['b', 'c', 'd'],
  //     productions,
  //     startSymbol: 'S',
  //   };
  //   const grammar = new Grammar(cfg);
  //   expect(grammar.hasDirectNondeterminismIn(productions.get('S'))).toBe(true);
  // });

  // it('should not have direct nondeterminism', () => {
  //   const productions = new Map();
  //   productions.set('S', ['bcD', 'cBcd', 'dcd']);
  //   productions.set('B', ['bB', 'b']);
  //   productions.set('D', ['dD', 'd']);
  //   const cfg = {
  //     nonterminals: ['S', 'B', 'D'],
  //     terminals: ['b', 'c', 'd'],
  //     productions,
  //     startSymbol: 'S',
  //   };
  //   const grammar = new Grammar(cfg);
  //   expect(grammar.hasDirectNondeterminismIn(productions.get('S'))).toBe(false);
  // });

  // it('should remove direct nondeterminism from productions of nonterminal', () => {
  //   const productions = new Map();
  //   productions.set('S', ['bcD', 'bBcd', 'bcd']);
  //   productions.set('B', ['bB', 'b']);
  //   productions.set('D', ['dD', 'd']);
  //   const cfg = {
  //     nonterminals: ['S', 'B', 'D'],
  //     terminals: ['b', 'c', 'd'],
  //     productions,
  //     startSymbol: 'S',
  //   };
  //   const grammar1 = new Grammar(cfg);
  //   const grammar2 = new Grammar(cfg);
  //   grammar1.removeDirectNondeterminismOf('S');
  //   expect(grammar1.productions).toBe('');
  // });

  it('should remove direct nondeterminism', () => {
    const productions = new Map();
    productions.set('S', ['bcD', 'bBcd', 'bcd']);
    productions.set('B', ['bB', 'b']);
    productions.set('D', ['dD', 'd']);
    const cfg = {
      nonterminals: ['S', 'B', 'D'],
      terminals: ['b', 'c', 'd'],
      productions,
      startSymbol: 'S',
    };
    const grammar1 = new Grammar(cfg);
    const grammar2 = new Grammar(cfg);
    grammar1.removeDirectNondeterminism();
    expect(grammar1.productions).toBe('');
  });

  // it('should remove left recursion from grammar', () => {});
});
