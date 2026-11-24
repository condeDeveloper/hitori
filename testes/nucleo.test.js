import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contaFormas, contaIndependentes } from '../js/formas.js'
import { resolve, gera, sorteador, confere, brancasLigadas } from '../js/hitori.js'
import { forcaBruta, porRamos, listaFormas, resolvePorFormas } from '../js/juiz.js'

test('formas que se contam a mao: 1x1 = 1, 1x2 = 3, 2x2 = 5', () => {
  // 1x2: nada preto, so a esquerda, so a direita
  assert.equal(contaFormas(1, 1), 1n)
  assert.equal(contaFormas(1, 2), 3n)
  // 2x2: nada, ou uma das quatro casas (duas pretas se encostam ou isolam)
  assert.equal(contaFormas(2, 2), 5n)
})

test('uma faixa 1 x n so aceita pretas nas pontas: n - 2 casas do meio cortariam a faixa', () => {
  for (let n = 3; n <= 9; n++) assert.equal(contaFormas(1, n), 4n)
})

test('os independentes conferem com a forca bruta', () => {
  for (const [a, l] of [[2, 2], [3, 3], [3, 4], [4, 4]]) assert.equal(Number(contaIndependentes(a, l)), forcaBruta(a, l).independentes)
})

test('a contagem por numero de pretas soma o total', () => {
  for (const [a, l] of [[3, 3], [4, 5], [5, 5]]) {
    const v = contaFormas(a, l, { porPretas: true })
    assert.equal(v.reduce((x, y) => x + y, 0n), contaFormas(a, l))
  }
})

test('a lista de formas do juiz tem o mesmo tamanho que a contagem', () => {
  assert.equal(listaFormas(4, 4).length, 562)
  assert.equal(listaFormas(3, 5).length, porRamos(3, 5).total)
})

test('brancasLigadas: uma preta no meio da cruz nao separa, uma diagonal de pretas separa', () => {
  const p = new Uint8Array(9)
  p[4] = 1
  assert.equal(brancasLigadas(p, 3), true)
  const q = new Uint8Array(9)
  q[2] = 1; q[4] = 1; q[6] = 1
  assert.equal(brancasLigadas(q, 3), false)
})

test('resolve um tabuleiro de solucao unica e acha a mesma solucao que o juiz', () => {
  const g = [1, 1, 2, 2, 3, 1, 3, 2, 3]
  const s = resolve(g, 3)
  assert.equal(s.total, resolvePorFormas(g, 3, listaFormas(3, 3)))
  if (s.total === 1) assert.equal(confere(g, 3, s.primeira).ok, true)
})

test('um quadrado latino aceita TODAS as formas como solucao', () => {
  const g = [1, 2, 3, 4, 2, 3, 4, 1, 3, 4, 1, 2, 4, 1, 2, 3]
  assert.equal(resolve(g, 4).total, 562)
})

test('o gerador sai com solucao unica e a solucao cumpre as tres regras', () => {
  for (const n of [5, 6, 7, 8]) {
    const r = gera(n, sorteador(100 + n))
    assert.equal(resolve(r.grade, n, { limite: 2 }).total, 1)
    assert.equal(confere(r.grade, n, r.solucao).ok, true)
  }
})

test('confere aponta cada uma das tres regras quebradas', () => {
  const g = [1, 1, 2, 2, 1, 3, 3, 2, 1]
  assert.equal(confere(g, 3, new Uint8Array(9)).motivo, 'número repetido numa linha')
  const vizinhas = new Uint8Array(9)
  vizinhas[0] = 1; vizinhas[1] = 1
  assert.equal(confere(g, 3, vizinhas).motivo, 'duas pretas se encostam')
  const separa = new Uint8Array(9)
  separa[1] = 1; separa[3] = 1
  assert.equal(confere([1, 2, 3, 2, 3, 1, 3, 1, 2], 3, separa).motivo, 'as brancas estão separadas')
})
