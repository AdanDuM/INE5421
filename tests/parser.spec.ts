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

  it('should have direct nondeterminism', () => {
    const productions = new Map();
    productions.set('S', [
      ['b', 'c', 'D'],
      ['b', 'B', 'c', 'd'],
      ['b', 'c', 'd'],
    ]);
    productions.set('B', [['b', 'B'], ['b']]);
    productions.set('D', [['d', 'D'], ['d']]);
    const cfg = {
      nonterminals: ['S', 'B', 'D'],
      terminals: ['b', 'c', 'd'],
      productions,
      startSymbol: 'S',
    };
    const grammar = new Grammar(cfg);
    expect(grammar.hasDirectNondeterminismIn(productions.get('S'))).toBe(true);
  });

  it('should not have direct nondeterminism', () => {
    const productions = new Map();
    productions.set('S', [
      ['b', 'c', 'D'],
      ['c', 'B', 'c', 'd'],
      ['d', 'c', 'd'],
    ]);
    productions.set('B', [['b', 'B'], ['b']]);
    productions.set('D', [['d', 'D'], ['d']]);
    const cfg = {
      nonterminals: ['S', 'B', 'D'],
      terminals: ['b', 'c', 'd'],
      productions,
      startSymbol: 'S',
    };
    const grammar = new Grammar(cfg);
    expect(grammar.hasDirectNondeterminismIn(productions.get('S'))).toBe(false);
  });

  it('should remove direct nondeterminism from productions of nonterminal', () => {
    const productions = new Map();
    productions.set('S', [
      ['b', 'c', 'D'],
      ['b', 'B', 'c', 'd'],
      ['b', 'c', 'd'],
    ]);
    productions.set('B', [['b', 'B'], ['b']]);
    productions.set('D', [['d', 'D'], ['d']]);
    const cfg = {
      nonterminals: ['S', 'B', 'D'],
      terminals: ['b', 'c', 'd'],
      productions,
      startSymbol: 'S',
    };
    const grammar1 = new Grammar(cfg);
    const grammar2 = new Grammar(cfg);
    grammar1.removeDirectNondeterminismOf('S');
    expect(grammar1.productions).toBe('');
  });

  // it('should remove direct nondeterminism', () => {
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
  //   grammar1.removeDirectNondeterminism();
  //   expect(grammar1.productions).toBe('');
  // });

  // it('should create firsts set from grammar', () => {
  //   const productions = new Map();
  //   productions.set('P', ['KVC']);
  //   productions.set('K', ['cK', '&']);
  //   productions.set('V', ['vV', 'F']);
  //   productions.set('F', ['fP;F', '&']);
  //   productions.set('C', ['bVCe', 'com;C', '&']);
  //   const cfg = {
  //     nonterminals: ['P', 'K', 'V', 'F', 'C'],
  //     terminals: ['c', 'v', 'f', '; ', 'b', 'e', 'com'],
  //     productions,
  //     startSymbol: 'P',
  //   };
  //   const grammar1 = new Grammar(cfg);

  //   const parser = new Parser(grammar1);
  //   parser.findFirtsOfGrammar();
  //   expect(parser.findFirtsOfGrammar()).toBe('');
  // });

  // it('should remove left recursion from grammar', () => {});
});
