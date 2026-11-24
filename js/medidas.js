// As tabelas do README, uma funcao por tabela. O medidor imprime, os testes
// prendem.

import { contaFormas, contaIndependentes } from './formas.js'
import { resolve } from './hitori.js'
import { forcaBruta, porRamos, listaFormas, resolvePorFormas } from './juiz.js'

// As formas de cada quadrado, e quantos conjuntos independentes sobram sem a
// regra das brancas.
export function quadrados (de, ate) {
  const r = []
  for (let n = de; n <= ate; n++) {
    r.push({ n, formas: contaFormas(n, n), independentes: contaIndependentes(n, n) })
  }
  return r
}

// O maximo de pretas numa forma n x n, e quantas formas chegam nele.
export function maximos (de, ate) {
  const r = []
  for (let n = de; n <= ate; n++) {
    const v = contaFormas(n, n, { porPretas: true })
    let k = v.length - 1
    while (v[k] === 0n) k--
    r.push({ n, maxPretas: k, quantas: v[k] })
  }
  return r
}

// A x L contra L x A: a matriz de transferencia anda com fronteiras de
// larguras diferentes, entao a igualdade nao vem de graca.
export function transpostas (ate) {
  const r = []
  for (let a = 1; a <= ate; a++) {
    for (let l = a + 1; l <= ate; l++) {
      const x = contaFormas(a, l)
      const y = contaFormas(l, a)
      r.push({ a, l, x, y, iguais: x === y })
    }
  }
  return r
}

// Os tres contadores juntos, ate onde o juiz aguenta.
export function confronto () {
  const r = []
  for (const [a, l] of [[2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5]]) {
    const b = forcaBruta(a, l)
    const c = porRamos(a, l)
    const p = contaFormas(a, l, { porPretas: true }).map(Number)
    r.push({
      a, l,
      transferencia: Number(contaFormas(a, l)),
      forcaBruta: b.total,
      ramos: c.total,
      independentes: b.independentes,
      porPretasIgual: JSON.stringify(p) === JSON.stringify(c.porPretas)
    })
  }
  return r
}

// O 6x6 so pelos ramos: 5.598.861 mascaras sem pretas vizinhas.
export function confrontoSeis () {
  const c = porRamos(6, 6)
  const p = contaFormas(6, 6, { porPretas: true }).map(Number)
  return { ramos: c.total, transferencia: Number(contaFormas(6, 6)), independentes: c.independentes, porPretasIgual: JSON.stringify(p) === JSON.stringify(c.porPretas) }
}

function permutacoes (v) {
  if (v.length <= 1) return [v]
  const r = []
  v.forEach((x, i) => { for (const p of permutacoes([...v.slice(0, i), ...v.slice(i + 1)])) r.push([x, ...p]) })
  return r
}

// Os tabuleiros pequenos inteiros: quantos tem solucao unica, nenhuma ou
// varias.
//   tres   3x3 com numeros de 1 a 3, todos os 3^9
//   quatro 4x4 em que cada linha e uma permutacao de 1 a 4, todos os 24^4
export function * tabuleiros (nome) {
  if (nome === 'tres') {
    for (let m = 0; m < 3 ** 9; m++) {
      const g = []
      let x = m
      for (let i = 0; i < 9; i++) { g.push((x % 3) + 1); x = Math.floor(x / 3) }
      yield g
    }
  } else {
    const P = permutacoes([1, 2, 3, 4])
    for (const a of P) for (const b of P) for (const c of P) for (const d of P) yield [...a, ...b, ...c, ...d]
  }
}

export function puzzles (nome) {
  const n = nome === 'tres' ? 3 : 4
  let total = 0
  let nenhuma = 0
  let unica = 0
  let varias = 0
  let maior = 0
  let nos = 0
  for (const g of tabuleiros(nome)) {
    total++
    const s = resolve(g, n)
    nos += s.nos
    if (s.total === 0) nenhuma++
    else if (s.total === 1) unica++
    else varias++
    if (s.total > maior) maior = s.total
  }
  return { total, nenhuma, unica, varias, maior, nos }
}

// O resolvedor contra o juiz que testa forma por forma.
export function confrontoPuzzles (nome) {
  const n = nome === 'tres' ? 3 : 4
  const fs = listaFormas(n, n)
  let total = 0
  let dif = 0
  for (const g of tabuleiros(nome)) {
    total++
    if (resolve(g, n).total !== resolvePorFormas(g, n, fs)) dif++
  }
  return { total, dif, formas: fs.length }
}
