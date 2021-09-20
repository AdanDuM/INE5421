// [ ] Eliminação de recursão à esquerda
// [x] Fatoração

class Grammar {
  nonterminals: Array<string>;

  terminals: Array<string>;

  productions: Map<string, Set<string>>;

  startSymbol: string;

  constructor({ nonterminals, terminals, productions, startSymbol }: Grammar) {
    this.nonterminals = nonterminals;
    this.terminals = terminals;
    this.productions = productions;
    this.startSymbol = startSymbol;
  }

  getProductionsOf? = (symbol: string): Set<string> => {
    return this.productions.get(symbol);
  };

  getProductionsArrayOf? = (nonterminal: string): Array<string> => {
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

  hasDirectNondeterminismIn? = (productions: Array<string>): boolean => {
    const remainderProductions = productions.slice().sort();
    let production = remainderProductions.shift();
    while (remainderProductions.length) {
      const alphaSymbol = production.charAt(0);
      if (this.isTerminal(alphaSymbol)) {
        // se tem producoes que comecam com o mesmo terminal
        // hasMoreThanOneProductionStartingWithSameTerminal
        const hasMoreThanOneProductionStartingWithSameTerminal =
          remainderProductions.find(p => p.charAt(0).includes(alphaSymbol));

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
    const alphaSymbol = productions
      .find(p => this.isTerminal(p.charAt(0)))
      .charAt(0);

    const newProductionHead = `${nonterminal}'`;
    let productionWithNondeterminism = productions.filter(p =>
      p.charAt(0).includes(alphaSymbol),
    );
    const productionWithoutNondeterminism = productions.filter(
      p => !p.charAt(0).includes(alphaSymbol),
    );
    productionWithNondeterminism = productionWithNondeterminism
      .map(p => p.slice(1))
      .filter(p => p);

    const hasSymbolWithOnlyAlpha = productions.filter(p =>
      p.includes(alphaSymbol),
    );

    if (hasSymbolWithOnlyAlpha) {
      productionWithNondeterminism.push('&');
    }

    const newDeterministicProduction = `${alphaSymbol}${newProductionHead}`;
    this.productions.set(
      nonterminal,
      new Set([newDeterministicProduction, ...productionWithoutNondeterminism]),
    );
    this.productions.set(
      newProductionHead,
      new Set([...productionWithNondeterminism]),
    );
    this.productions = new Map([...this.productions.entries()].sort());

    const productions1 = Array.from(this.getProductionsOf(newProductionHead))
      .slice()
      .sort();

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

  // leftFactor = (): Grammar => {
  //   const nonterminals: Array<string> = [];
  //   const terminals: Array<string> = [];
  //   const productions: Map<string, Array<string>> = new Map();
  //   const startSymbol = '';

  //   this.removeIndirectNondeterminism();
  //   this.removeDirectNondeterminism();
  //   /*
  //   remove indireto
  //   remove direto

  //   procura indireto
  //   se tiver faz novamente mas olha por loop
  //   caso não tenha retorna
  //   */

  //   return new Grammar(nonterminals, terminals, productions, startSymbol);
  // };
}

export default Grammar;
