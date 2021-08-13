export type SingleExprOperator = {
  type: 'star' | 'plus' | 'optional';
  value: DoubleExprOperator | SingleExprOperator | string;
};
export type DoubleExprOperator = {
  type: 'concat' | 'or';
  left: DoubleExprOperator | SingleExprOperator | string;
  right: DoubleExprOperator | SingleExprOperator | string;
};
export type SyntaxTree = SingleExprOperator['value'];

const singleExprOperatorSymbols: { [k: string]: SingleExprOperator['type'] } = {
  '*': 'star',
  '+': 'plus',
  '?': 'optional',
};
const doubleExprOperatorSymbols: { [k: string]: DoubleExprOperator['type'] } = {
  '.': 'concat',
  '|': 'or',
};
const operatorSymbols = {
  ...singleExprOperatorSymbols,
  ...doubleExprOperatorSymbols,
};

function getParentesisStart(
  expression: string,
  closingParentesis: number,
): number {
  const stack: string[] = [')'];
  let i = closingParentesis - 1;
  for (; i >= 0; i--) {
    let prevChar = (i >= 1) ? expression.charAt(i - 1) : ""
    const currChar = expression.charAt(i);

    // Cada fechamento de parentesis aumenta stack
    if (prevChar !== "\\" && currChar === ')') {
      stack.push(')');
      continue;
    }

    // Cada abertura de parentesis diminui a stack
    if (prevChar !== "\\" && currChar === '(') stack.pop();

    // Stack vazia, a expressao dentro do parentesis acabou
    if (stack.length === 0) break;
  }

  // Caso ainda existam parentesis a serem fechados, retorna erro
  if (stack.length !== 0)
    throw new Error(
      `Couldn't fully close the parentesis at ${closingParentesis}`,
    );

  return i;
}

// Quebra uma expressao na menor possivel à direita + restante à esquerda,
// considerando parentesis
function safeSplitExpr(expression: string): { left: string; right: string } {
  let right = expression.substr(-1);
  if (right === "\\")
    throw new Error('"\\" without the scaped symbol')

  let left = expression.substring(0, expression.length - 1);
  const leftLast = left.substr(-1)

  // Não é possível abrir um parentesis e nao fechar
  if (leftLast !== "\\" && right === '(') throw new Error(`Parentesis without it's closing twin`);

  // Temos um parentesis como primeira expressão à direita e o resto como esquerda
  if (leftLast !== "\\" && right === ')') {
    const parentesisStart = getParentesisStart(
      expression,
      expression.length - 1,
    );

    // Caso a parte de dentro do parentesis seja vazia, erro
    right = expression.substring(parentesisStart + 1, expression.length - 1);
    if (!right) throw new Error('Empty parentesis are not allowed');

    return {
      left: expression.substring(0, parentesisStart),
      right,
    };
  }

  return { left, right };
}

export function NewSyntaxTree(expression: string): SyntaxTree {
  // Se a string estiver vazia, erro
  if (!expression) throw new Error('Empty expression');

  // Caso a expressao tenha tamanho 1, é o fundo de alguma recursao
  if (expression.length === 1) {
    // Caso seja um operador, erro (pois falta o simbolo/expressao)
    if (operatorSymbols[expression])
      throw new Error('Operator without symbol/expression');

    // Caso seja uma contrabarra, erro, pois falta o simbolo escapado
    if (expression === '\\')
      throw new Error('"\\" without the scaped symbol')

    // Senao, retorna o simbolo, apenas
    return expression;
  }

  // Procura um "or" no primeiro nivel, que divida a expressao em dois lados
  for (let i = expression.length - 1; i >= 0; i--) {
    let prevChar = (i >= 1) ? expression.charAt(i - 1) : ""
    let currChar = expression.charAt(i);

    // Pula o interior de qualquer parentesis, considera apenas o nivel mais alto
    while (prevChar !== "\\" && currChar === ')') {
      i = getParentesisStart(expression, i) - 1;

      // Se i for negativo, entao não existem "or" à esquerda
      if (i < 0) break;

      // Atualiza o char atual
      currChar = expression.charAt(i);
    }
    // Se i for negativo, entao não existem "or" à esquerda
    if (i < 0) break;

    // Não é possível abrir um parentesis e nao fechar
    if (prevChar !== "\\" && currChar === '(')
      throw new Error(`Parentesis without it's closing twin`);

    // Encontrou um "or", então divide a expressao em duas, ligadas por um nodo
    // "or"
    if (prevChar !== "\\" && operatorSymbols[currChar] === 'or') {
      const rightExpr = expression.substring(i + 1);
      const leftExpr = expression.substring(0, i);
      if (!rightExpr || !leftExpr)
        throw new Error('"or" operator without its two symbols/expressions');

      return {
        right: NewSyntaxTree(rightExpr),
        left: NewSyntaxTree(leftExpr),
        type: 'or',
      };
    }
  }

  // Sabemos que a expressao não pode ser dividida em duas por um "or"
  // no primeiro nivel, portanto dividiremos entre expressao à extrema
  // direita concatenada com restante à esquerda
  const { left, right } = safeSplitExpr(expression);

  // Caso nao tenha sobrado nada à esquerda, retorna arvore à direita
  if (!left) return NewSyntaxTree(right);

  if (left === "\\") return right

  // Caso à direita não exista um operador, retorna as arvores da esquerda
  // e direita, concatenadas
  if (!operatorSymbols[right])
    return {
      right: NewSyntaxTree(right),
      left: NewSyntaxTree(left),
      type: 'concat',
    };

  // Caso o ultimo simbolo da esquerda seja uma contrabarra, entao nao considera
  // a direita como operador, e sim como simbolo simples
  const leftLast = left.substr(-1)
  if (leftLast === "\\") {
      const newLeft = left.substring(0, left.length - 1)
      if (!newLeft)
        return right;

    return {
      left: NewSyntaxTree(newLeft),
      right,
      type: 'concat',
    }
  }

  // Garante que nao vai ter um "or" aqui (loop do inicio deveria pegar)
  // ou um concat
  if (doubleExprOperatorSymbols[right])
    throw new Error(`Illegal '${right}' operator usage`);

  // Caso seja um operador sem contrabarra, divide a esquerda novamente
  const { left: newLeft, right: operand } = safeSplitExpr(left);
  const rightTree = {
    value: NewSyntaxTree(operand),
    type: singleExprOperatorSymbols[right],
  };

  // Caso nao tenha sobrado nada à esquerda, retorna arvore à direita
  if (!newLeft) return rightTree;

  // Caso ainda exista algo à esquerda, concatena com a direita
  return {
    right: rightTree,
    left: NewSyntaxTree(newLeft),
    type: 'concat',
  };
}
