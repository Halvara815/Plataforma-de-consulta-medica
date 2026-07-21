// Evaluador de expresiones matemáticas seguro (tokenizer + shunting-yard).
// Deliberadamente no usa eval()/Function() para evitar cualquier riesgo de inyección.

const FUNCTIONS = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
  log: Math.log10,
  ln: Math.log,
  sqrt: Math.sqrt
};

const CONSTANTS = { pi: Math.PI, e: Math.E };

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let name = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      const lower = name.toLowerCase();
      if (CONSTANTS[lower] !== undefined) tokens.push({ type: 'number', value: CONSTANTS[lower] });
      else tokens.push({ type: 'function', value: lower });
      continue;
    }
    if ('+-*/^(),%'.includes(c)) {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    throw new Error(`Carácter no válido: "${c}"`);
  }
  return tokens;
}

const PRECEDENCE = { u: 4, '^': 3, '*': 2, '/': 2, '%': 2, '+': 1, '-': 1 };

function toRpn(tokens) {
  const output = [];
  const stack = [];
  let prev = null;

  tokens.forEach((tok) => {
    if (tok.type === 'number') {
      output.push(tok);
    } else if (tok.type === 'function') {
      stack.push(tok);
    } else if (tok.value === ',') {
      while (stack.length && stack[stack.length - 1].value !== '(') output.push(stack.pop());
    } else if (tok.value === '(') {
      stack.push(tok);
    } else if (tok.value === ')') {
      while (stack.length && stack[stack.length - 1].value !== '(') output.push(stack.pop());
      stack.pop();
      if (stack.length && stack[stack.length - 1].type === 'function') output.push(stack.pop());
    } else {
      // operador: detectar menos unario
      const isUnaryMinus = tok.value === '-' && (!prev || (prev.type === 'op' && prev.value !== ')'));
      const opTok = isUnaryMinus ? { type: 'op', value: 'u', unary: true } : tok;
      while (
        stack.length &&
        stack[stack.length - 1].type === 'op' &&
        stack[stack.length - 1].value !== '(' &&
        (PRECEDENCE[stack[stack.length - 1].value] > PRECEDENCE[opTok.value] ||
          (PRECEDENCE[stack[stack.length - 1].value] === PRECEDENCE[opTok.value] && opTok.value !== '^' && opTok.value !== 'u'))
      ) {
        output.push(stack.pop());
      }
      stack.push(opTok);
    }
    prev = tok;
  });

  while (stack.length) output.push(stack.pop());
  return output;
}

function evalRpn(rpn) {
  const stack = [];
  rpn.forEach((tok) => {
    if (tok.type === 'number') {
      stack.push(tok.value);
    } else if (tok.type === 'function') {
      const fn = FUNCTIONS[tok.value];
      if (!fn) throw new Error(`Función desconocida: ${tok.value}`);
      stack.push(fn(stack.pop()));
    } else if (tok.value === 'u') {
      stack.push(-stack.pop());
    } else {
      const b = stack.pop();
      const a = stack.pop();
      switch (tok.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(a / b);
          break;
        case '%':
          stack.push(a % b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Operador desconocido: ${tok.value}`);
      }
    }
  });
  if (stack.length !== 1) throw new Error('Expresión inválida');
  return stack[0];
}

export function evaluateExpression(expr) {
  if (!expr || !expr.trim()) return 0;
  const tokens = tokenize(expr);
  const rpn = toRpn(tokens);
  const result = evalRpn(rpn);
  if (!Number.isFinite(result)) throw new Error('Resultado no numérico');
  return result;
}
