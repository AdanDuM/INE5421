type SyntaxTreeNode = {
  type: 'concat' | 'star' | 'plus' | 'or' | 'optional'
  left: SyntaxTreeNode | string | null
  right: SyntaxTreeNode | string | null
}

const operatorSymbols: { [k: string]: SyntaxTreeNode['type'] } = {
  '.': 'concat',
  '*': 'star',
  '+': 'plus',
  '|': 'or',
  '?': 'optional'
}

function regex2syntaxTree(str: string): SyntaxTreeNode | string {
  if (!str)
    // String vazia
    return '#'
  if (str.length === 1) {
    if (!!operatorSymbols[str])
      // A string nao pode ser composta so de operadores
      throw new Error('Regular Expressions cannot be composed of operators only')

    return {
      type: 'concat',
      left: str,
      right: '#'
    }
  }

  const firstNode: SyntaxTreeNode = {
    type: 'concat',
    right: '#'
  }
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str.charAt(i)
  }
}

function buildSyntaxTree(expression: string): SyntaxTreeNode | string | null {
  if (!expression)
    // Se a string estiver vazia, acabou a expressao
    return null

  const idx = expression.length - 1
  const char = expression.substr(idx)
  const subExpr = expression.substr(0, idx)
  if (!!operatorSymbols[char]) {
    if (!subExpr)
      // Caso um operador nao possua mais nada à sua frente, temos um erro
      throw new Error(`There's an operator without symbol/expression at ${idx}`)

    const nextChar = subExpr.substr(-1)
    if (!!operatorSymbols[nextChar])
      // Se o proximo char é outro operador, erro
      throw new Error(`An operator is being applied directly to another operator at ${idx}`)

    if (nextChar !== ')') {
      // Se o proximo char for um simbolo, o operador se aplica apenas a ele
      return {
        type: operatorSymbols[expression.substr(-1)],
        left:
      }
    }
      // Se o proximo char for um parentesis, entao o operador se aplica
      // à uma expressão inteira, não apenas um simbolo

  }

  return {
    type: 'concat',
    left: buildSyntaxTree(expression.substr(0, expression.length - 1)),
    right: expression.substr(-1)
  }
}
