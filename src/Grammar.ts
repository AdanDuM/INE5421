// [ ] Eliminação de recursão à esquerda
// [1/2] Fatoração

class Grammar {
  nonterminals: Array<string>;

  terminals: Array<string>;

  productions: Map<string, Set<Array<string>>>;

  startSymbol: string;

  constructor({ nonterminals, terminals, productions, startSymbol }: Grammar) {
    this.nonterminals = nonterminals;
    this.terminals = terminals;
    this.productions = productions;
    this.startSymbol = startSymbol;
  }

  getProductionsOf? = (symbol: string): Set<Array<string>> => {
    return this.productions.get(symbol);
  };

  getProductionsArrayOf? = (nonterminal: string): Array<Array<string>> => {
    return Array.from(this.getProductionsOf(nonterminal)).slice();
  };

  isTerminal? = (symbol: string): boolean => {
    return this.terminals.includes(symbol);
  };

  // findIndirectRecursion = () => {};

  // findDirectRecursion = () => {};

  // removeIndirectRecursion = () => {};

  // removeDirectRecursion = () => {};

  // removeLeftRecursion = (): Grammar => {}

  // hasIndirectNondeterminismInProductionOf = () => {};

  hasDirectNondeterminismIn? = (productions: Array<Array<string>>): boolean => {
    const remainderProductions = productions.slice().sort();
    let production = remainderProductions.shift();
    while (remainderProductions.length) {
      const alphaSymbol = production[0];
      if (this.isTerminal(alphaSymbol)) {
        const hasMoreThanOneProductionStartingWithSameTerminal =
          remainderProductions.find(p => p[0].includes(alphaSymbol));

        if (hasMoreThanOneProductionStartingWithSameTerminal) {
          return true;
        }
      }
      production = remainderProductions.shift();
    }
    return false;
  };

  removeIndirectNondeterminism? = (nonterminal: string): void => {
    const productions = this.getProductionsArrayOf(nonterminal);
  };

  // removeIndirectNondeterminism? = () => {
  //   this.nonterminals.forEach(nonterminal => {
  //     if (this.hasDirectNondeterminismInProductionOf(nonterminal)) {
  //       const productionHead = `${nonterminal}'`;
  //       this.productions.get(nonterminal).forEach(production => {
  //         // caso possua naodeterminismo
  //         // production
  //       });
  //     }
  //   });
  // };

  removeDirectNondeterminismOf? = (nonterminal: string): void => {
    const productions = this.getProductionsArrayOf(nonterminal);
    const alphaSymbol = productions.find(p => this.isTerminal(p[0]))[0];

    const newProductionHead = `${nonterminal}'`;
    let productionWithNondeterminism = productions.filter(p =>
      p[0].includes(alphaSymbol),
    );
    const productionWithoutNondeterminism = productions.filter(
      p => !p[0].includes(alphaSymbol),
    );
    productionWithNondeterminism = productionWithNondeterminism
      .map(p => p.slice(1))
      .filter(p => p);

    const hasSymbolWithOnlyAlpha = productions.filter(p => p === [alphaSymbol]);

    if (hasSymbolWithOnlyAlpha) {
      productionWithNondeterminism.push(['&']);
    }

    const newDeterministicProduction = [alphaSymbol, newProductionHead];
    this.productions.set(
      nonterminal,
      new Set([newDeterministicProduction, ...productionWithoutNondeterminism]),
    );
    this.productions.set(
      newProductionHead,
      new Set([...productionWithNondeterminism]),
    );
    this.productions = new Map([...this.productions.entries()].sort());

    const productions1 = this.getProductionsArrayOf(newProductionHead).sort();

    if (this.hasDirectNondeterminismIn(productions1)) {
      this.removeDirectNondeterminismOf(newProductionHead);
    }
  };

  removeDirectNondeterminism? = (): void => {
    const nonterminals = this.nonterminals.sort();
    let hasNonterminalsToLook = true;
    let nonterminal = nonterminals.shift();
    while (hasNonterminalsToLook) {
      this.productions = new Map([...this.productions.entries()].sort());
      const productions = Array.from(this.getProductionsOf(nonterminal))
        .slice()
        .sort();

      if (this.hasDirectNondeterminismIn(productions)) {
        this.removeDirectNondeterminismOf(nonterminal);
      }

      if (!nonterminals.length) {
        hasNonterminalsToLook = false;
      }
      nonterminal = nonterminals.shift();
    }
  };

  leftFactor? = (): Grammar => {
    const nonterminals: Array<string> = [];
    const terminals: Array<string> = [];
    const productions: Map<string, Set<Array<string>>> = new Map();
    const startSymbol = '';

    // this.removeIndirectNondeterminism();
    this.removeDirectNondeterminism();

    const grammar = {
      nonterminals,
      terminals,
      productions,
      startSymbol,
    };

    return new Grammar(grammar);
  };
}

export default Grammar;
