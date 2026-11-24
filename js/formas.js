// As formas de uma solucao de Hitori. ESM puro, sem DOM.
//
// Toda solucao de Hitori pinta algumas casas de preto, e duas regras valem
// para qualquer tabuleiro, sejam quais forem os numeros:
//
//   1. duas casas pretas nunca se encostam pelo lado;
//   2. as casas brancas formam um pedaco so, ligado pelos lados.
//
// Uma "forma" e uma mascara de pretas que cumpre as duas. Aqui elas sao
// contadas por matriz de transferencia: o tabuleiro e varrido casa a casa, em
// ordem de leitura, e o estado e a FRONTEIRA, a ultima casa vista de cada
// coluna. Cada casa da fronteira e preta ou branca, e as brancas levam um
// rotulo de componente: duas brancas com o mesmo rotulo ja estao ligadas por
// um caminho branco atras da fronteira.
//
// O ponto delicado e quando um rotulo some da fronteira: aquele pedaco branco
// fechou e nao cresce mais. Isso so e permitido se ele for o UNICO pedaco
// branco do tabuleiro inteiro, entao todas as outras casas da fronteira tem de
// ser pretas, e dali para frente nao pode aparecer branco nenhum.

const PRETA = -1

// Renumera os rotulos na ordem em que aparecem, para que estados iguais tenham
// a mesma chave.
function normaliza (f) {
  const m = new Map()
  return f.map((x) => {
    if (x === PRETA) return PRETA
    if (!m.has(x)) m.set(x, m.size)
    return m.get(x)
  })
}

// Conta as formas de um tabuleiro de A linhas e L colunas. Com porPretas,
// devolve um vetor: quantas formas tem 0 pretas, 1 preta, 2 pretas...
// Contas em BigInt: o 10x10 ja passa de 2^53.
export function contaFormas (A, L, { porPretas = false } = {}) {
  // estado: chave -> { f: fronteira, fechado: bool, c: BigInt ou vetor de BigInt }
  const soma = (a, b) => {
    if (!porPretas) return a + b
    const r = a.length >= b.length ? a.slice() : b.slice()
    const o = a.length >= b.length ? b : a
    for (let i = 0; i < o.length; i++) r[i] += o[i]
    return r
  }
  const desloca = (c) => porPretas ? [0n, ...c] : c
  let estados = new Map()
  const inicial = new Array(L).fill(PRETA)
  // a linha "-1" e toda preta de mentira: nao conta como preta vizinha
  estados.set('ini', { f: inicial, fechado: false, c: porPretas ? [1n] : 1n, virgem: true })
  for (let r = 0; r < A; r++) {
    for (let col = 0; col < L; col++) {
      const novos = new Map()
      const poe = (f, fechado, c) => {
        const k = f.join(',') + (fechado ? '|F' : '')
        const e = novos.get(k)
        if (e) e.c = soma(e.c, c)
        else novos.set(k, { f, fechado, c })
      }
      for (const { f, fechado, c, virgem } of estados.values()) {
        const cima = r > 0 && !virgem ? f[col] : null // null: nao ha casa em cima
        const esq = col > 0 ? f[col - 1] : null
        // --- preta
        if (cima !== PRETA && esq !== PRETA) {
          const g = f.slice()
          g[col] = PRETA
          let fech = fechado
          let ok = true
          if (cima !== null && cima !== PRETA && !g.includes(cima)) {
            // o pedaco de cima fechou: tem de ser o unico branco
            if (g.some((x) => x !== PRETA)) ok = false
            else fech = true
          }
          if (ok) poe(normaliza(g), fech, desloca(c))
        }
        // --- branca
        if (!fechado) {
          const g = f.slice()
          const brancos = [cima, esq].filter((x) => x !== null && x !== PRETA)
          if (brancos.length === 0) {
            g[col] = 1000 // rotulo novo
          } else {
            const alvo = brancos[0]
            g[col] = alvo
            if (brancos.length === 2 && brancos[1] !== alvo) {
              for (let j = 0; j < L; j++) if (g[j] === brancos[1]) g[j] = alvo
            }
          }
          poe(normaliza(g), false, c)
        }
      }
      estados = novos
    }
  }
  let total = porPretas ? [] : 0n
  for (const { f, fechado, c } of estados.values()) {
    const rotulos = new Set(f.filter((x) => x !== PRETA))
    const ok = fechado ? rotulos.size === 0 : rotulos.size === 1
    if (ok) total = soma(total, c)
  }
  return total
}

// So a regra 1, sem a 2: os conjuntos independentes da grade. E o que a forma
// seria se branco desligado fosse permitido.
export function contaIndependentes (A, L) {
  let estados = new Map([[0, 1n]]) // mascara da fronteira (1 = preta) -> contagem
  for (let r = 0; r < A; r++) {
    for (let col = 0; col < L; col++) {
      const novos = new Map()
      for (const [m, c] of estados) {
        const cima = (m >> col) & 1
        const esq = col > 0 ? (m >> (col - 1)) & 1 : 0
        const branca = m & ~(1 << col)
        novos.set(branca, (novos.get(branca) || 0n) + c)
        if (!cima && !esq) {
          const preta = m | (1 << col)
          novos.set(preta, (novos.get(preta) || 0n) + c)
        }
      }
      estados = novos
    }
  }
  let t = 0n
  for (const c of estados.values()) t += c
  return t
}
