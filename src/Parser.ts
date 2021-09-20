// [x] Cálculo de First
// [x] Cálculo de Follow
// [-] Geração da tabela de análise
// [-] Autômato de pilha para análise de sentenças

import Grammar from './Grammar';

class Parser {
  private grammar: Grammar;

  private firsts: Map<string, Set<string>>;

  private follows: Map<string, Set<string>>;

  constructor(grammar: Grammar) {
    this.grammar = grammar;
    this.firsts = new Map();
    this.follows = new Map();
  }

  initializeFirstsOfEach = (nonterminal: Array<string>): void => {
    nonterminal.forEach(n => this.firsts.set(n, new Set()));
  };

  initializeFirstsOfEachTerminals = (terminal: Array<string>): void => {
    terminal.forEach(t => this.firsts.set(t, new Set([t])));
  };

  initializeFollowsOfEach = (nonterminal: Array<string>): void => {
    nonterminal.forEach(n => this.firsts.set(n, new Set()));
  };

  addEpsilonIfEpsilonProduction = (
    nonterminalSymbol: string,
    production: string,
  ): void => {
    const isEpsilonProduction = production === '&';
    if (isEpsilonProduction) {
      this.firsts.get(nonterminalSymbol).add(production);
    }
  };

  isTerminal = (symbol: string): boolean => {
    return this.grammar.terminals.includes(symbol);
  };

  noEpsilonIn = (set: Array<string>): boolean => {
    return !set.includes('&');
  };

  getFirstsOf = (symbol: string): Set<string> => {
    return this.firsts.get(symbol);
  };

  getFollowsOf = (symbol: string): Set<string> => {
    return this.follows.get(symbol);
  };

  addDollarSignToFollowsOfStartSymbol = (): void => {
    this.firsts.get(this.grammar.startSymbol).add('$');
  };

  findFirtsOfGrammar = (): Map<string, Set<string>> => {
    const { nonterminals, terminals, productions } = this.grammar;

    this.initializeFirstsOfEach(nonterminals);
    this.initializeFirstsOfEachTerminals(terminals);

    let hasNotFoundAllFirsts = true;
    while (hasNotFoundAllFirsts) {
      let unchangedFirstsAfterLoop = true;
      nonterminals.forEach(nonterminalSymbol => {
        productions.get(nonterminalSymbol).forEach(production => {
          this.addEpsilonIfEpsilonProduction(nonterminalSymbol, production);

          const symbols = production.split('');
          // eslint-disable-next-line no-restricted-syntax
          for (const symbol of symbols) {
            if (this.isTerminal(symbol)) {
              this.getFirstsOf(nonterminalSymbol).add(symbol);
              unchangedFirstsAfterLoop = false;
              break;
            } else {
              const nonterminalFirsts = Array.from(this.getFirstsOf(symbol));
              nonterminalFirsts.forEach(f =>
                this.getFirstsOf(nonterminalSymbol).add(f),
              );
              unchangedFirstsAfterLoop = false;
              if (this.noEpsilonIn(nonterminalFirsts)) {
                break;
              }
            }
          }
        });
      });
      if (unchangedFirstsAfterLoop) {
        hasNotFoundAllFirsts = false;
      }
    }

    return this.firsts;
  };

  findFollowsOfGrammar = (): Map<string, Set<string>> => {
    const { nonterminals, terminals, productions } = this.grammar;

    this.initializeFollowsOfEach(nonterminals);
    this.addDollarSignToFollowsOfStartSymbol();

    const productionBodies = Array.from(productions.values())
      .map(p => [...p])
      .flat();
    productionBodies.forEach(production => {
      const symbols = production.split('');

      // eslint-disable-next-line no-restricted-syntax
      for (const [index, symbol] of symbols.entries()) {
        const nextSymbol = symbols[index + 1];
        const isNonterminalSymbol = !this.isTerminal(symbol);

        if (isNonterminalSymbol) {
          const nextSymbolFirsts = Array.from(this.getFirstsOf(nextSymbol));
          nextSymbolFirsts.forEach(firstElement =>
            this.getFollowsOf(symbol).add(firstElement),
          );
          if (this.noEpsilonIn(nextSymbolFirsts)) {
            //
          }
        }
        const nonterminalFirsts = this.getFirstsOf(symbol);
        nonterminalFirsts.forEach(firstElement =>
          this.getFollowsOf(nextSymbol).add(firstElement),
        );
        const nonterminalFirstHasNoEpsilon = !nonterminalFirsts.has('&');
        if (nonterminalFirstHasNoEpsilon) {
          break;
        }
      }
    });

    let hasNotFoundAllFollows = true;
    while (hasNotFoundAllFollows) {
      let unchangedFollowsAfterLoop = true;
      nonterminals.forEach(nonterminalSymbol => {
        productions.get(nonterminalSymbol).forEach(production => {
          this.addEpsilonIfEpsilonProduction(nonterminalSymbol, production);

          const symbols = production.split('');
          // eslint-disable-next-line no-restricted-syntax
          for (const symbol of symbols) {
            const isTerminalSymbol = terminals.includes(symbol);

            if (isTerminalSymbol) {
              this.firsts.get(nonterminalSymbol).add(symbol);
              unchangedFollowsAfterLoop = false;
              break;
            } else {
              const nonterminalFirsts = this.firsts.get(symbol);
              nonterminalFirsts.forEach(f =>
                this.firsts.get(nonterminalSymbol).add(f),
              );
              unchangedFollowsAfterLoop = false;
              const nonterminalFirstHasNoEpsilon = !nonterminalFirsts.has('&');
              if (nonterminalFirstHasNoEpsilon) {
                break;
              }
            }
          }
        });
      });
      if (unchangedFollowsAfterLoop) {
        hasNotFoundAllFollows = false;
      }
    }

    return this.follows;
  };
}

export default Parser;
