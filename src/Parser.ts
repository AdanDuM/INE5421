// [x] Cálculo de First
// [x] Cálculo de Follow
// [-] Geração da tabela de análise
// [-] Autômato de pilha para análise de sentenças

import Grammar from './Grammar';

class Parser {
  private grammar: Grammar;

  firsts: Map<string, Set<string>>;

  follows: Map<string, Set<string>>;

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
    nonterminal.forEach(n => this.follows.set(n, new Set()));
  };

  // addEpsilonIfEpsilonProduction = (nonterminalSymbol: string): void => {
  //   const symbolProductions = this.grammar.productions.get(nonterminalSymbol);
  //   const isEpsilonProduction = Array.from(symbolProductions).includes(['&']);
  //   if (isEpsilonProduction) {
  //     this.getFirstsOf(nonterminalSymbol).add('&');
  //   }
  // };

  isTerminal = (symbol: string): boolean => {
    return this.grammar.terminals.includes(symbol);
  };

  isNonterminal = (symbol: string): boolean => {
    return this.grammar.nonterminals.includes(symbol);
  };

  haventFoundAllFirsts = (): boolean => {
    return !Array.from(this.firsts.values()).every(p => p.size);
  };

  haventFoundAllFollows = (): boolean => {
    return !Array.from(this.follows.values()).every(p => p.size);
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
    this.follows.get(this.grammar.startSymbol).add('$');
  };

  findAndWriteFirtsOfProductionHead = (nonterminal: string): void => {
    const { productions } = this.grammar;
    const productionsOfNonterminal = Array.from(productions.get(nonterminal));
    // eslint-disable-next-line no-restricted-syntax
    for (const production of productionsOfNonterminal) {
      // eslint-disable-next-line no-restricted-syntax
      for (const symbol of production) {
        if (this.isTerminal(symbol)) {
          this.getFirstsOf(nonterminal).add(symbol);
          break;
        } else if (this.isNonterminal(symbol)) {
          const nonterminalFirsts = Array.from(
            this.getFirstsOf(symbol),
          ).slice();

          if (nonterminalFirsts.length) {
            nonterminalFirsts.forEach(f =>
              this.getFirstsOf(nonterminal).add(f),
            );

            if (this.noEpsilonIn(nonterminalFirsts)) {
              break;
            }
          }
        } else {
          this.getFirstsOf(nonterminal).add(symbol);
          break;
        }
      }
    }
  };

  findFirtsOfGrammar = (): Map<string, Set<string>> => {
    const { nonterminals, terminals } = this.grammar;

    this.initializeFirstsOfEach(nonterminals);
    this.initializeFirstsOfEachTerminals(terminals);

    let loopLimit = nonterminals.length;
    while (this.haventFoundAllFirsts() || loopLimit) {
      nonterminals.forEach(nonterminalSymbol => {
        this.findAndWriteFirtsOfProductionHead(nonterminalSymbol);
      });
      loopLimit -= 1;
    }

    return this.firsts;
  };

  findPositionOfNonterminalInProduction = (
    nonterminal: string,
    production: Array<string>,
  ): number => {
    let pos = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const symbol of production) {
      if (symbol.includes(nonterminal)) {
        break;
      }
      pos += 1;
    }
    return pos;
  };

  findAndWriteFollowsOfProductionHead = (nonterminal: string): void => {
    const { productions } = this.grammar;
    const productionBodies = Array.from(productions.values())
      .map(p => [...p])
      .flat()
      .filter(p => !p.includes('&'));
    // eslint-disable-next-line no-restricted-syntax
    for (const production of productionBodies) {
      const position = this.findPositionOfNonterminalInProduction(
        nonterminal,
        production,
      );

      const startPositionOfBeta =
        production.length > position + 1 ? position + 1 : production.length;

      const beta = production.slice(startPositionOfBeta);
      // eslint-disable-next-line no-restricted-syntax
      for (const symbol of beta) {
        if (!symbol.includes(nonterminal)) {
          const nonterminalFirsts = Array.from(this.getFirstsOf(symbol))
            .slice()
            .filter(f => !f.includes('&'));

          if (this.isTerminal(symbol)) {
            this.getFollowsOf(nonterminal).add(symbol);
            break;
          }
          nonterminalFirsts.forEach(f => this.getFollowsOf(nonterminal).add(f));
          if (this.noEpsilonIn(nonterminalFirsts)) {
            break;
          }
        }
      }
    }
  };

  writeFollowOfHeadInNonterminalProductionsIfTerminalIsOmited = (
    nonterminal: string,
  ): void => {
    const { productions } = this.grammar;
    const productionBodies = Array.from(productions.get(nonterminal))
      .map(p => [...p])
      .filter(p => !p.includes('&'));

    // eslint-disable-next-line no-restricted-syntax
    for (const production of productionBodies) {
      const beta = production.slice().reverse();
      // eslint-disable-next-line no-restricted-syntax
      for (const symbol of beta) {
        if (this.isTerminal(symbol)) {
          break;
        }
        const nonterminalFirsts = Array.from(this.getFirstsOf(nonterminal));
        if (
          this.isNonterminal(symbol) ||
          !this.noEpsilonIn(nonterminalFirsts)
        ) {
          const nonterminalFollows = Array.from(this.getFollowsOf(nonterminal));
          nonterminalFollows.forEach(f => this.getFollowsOf(symbol).add(f));
          if (this.noEpsilonIn(nonterminalFirsts)) {
            break;
          }
        }
      }
    }
  };

  findFollowsOfGrammar = (): Map<string, Set<string>> => {
    const { nonterminals } = this.grammar;

    this.initializeFollowsOfEach(nonterminals);
    this.addDollarSignToFollowsOfStartSymbol();

    let loopLimit = nonterminals.length;
    while (loopLimit) {
      nonterminals.forEach(nonterminal => {
        this.findAndWriteFollowsOfProductionHead(nonterminal);
        this.writeFollowOfHeadInNonterminalProductionsIfTerminalIsOmited(
          nonterminal,
        );
      });
      loopLimit -= 1;
    }

    return this.follows;
  };
}

export default Parser;
