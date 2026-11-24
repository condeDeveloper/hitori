// Os numeros do README presos. Se o codigo mudar e um numero mudar, quebra.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quadrados, maximos, transpostas, confronto, puzzles } from '../js/medidas.js'

test('as formas de 1x1 a 13x13', () => {
  const q = quadrados(1, 13).map((x) => String(x.formas))
  assert.deepEqual(q, [
    '1', '5', '39', '562', '20297', '1646096', '296058640', '118930018898',
    '105847803502669', '208786414361204882', '912108074417652669264',
    '8821565703462781281195276', '188874908013037706102773241824'
  ])
})

test('os conjuntos sem pretas vizinhas, para a fracao', () => {
  const q = quadrados(5, 8).map((x) => String(x.independentes))
  assert.deepEqual(q, ['55447', '5598861', '1280128950', '660647962955'])
  const doze = quadrados(12, 12)[0]
  assert.equal(String(doze.independentes), '162481813349792588536582997')
})

test('o maximo de pretas e unico no 3x3, 5x5 e 7x7, e no 9x9 sao 1.952', () => {
  const m = maximos(2, 10).map((x) => [x.n, x.maxPretas, Number(x.quantas)])
  assert.deepEqual(m, [
    [2, 1, 4], [3, 4, 1], [4, 5, 36], [5, 9, 1], [6, 12, 104],
    [7, 17, 1], [8, 21, 8896], [9, 27, 1952], [10, 33, 168960]
  ])
})

test('A x L e L x A dao o mesmo numero em todos os 28 pares ate 8', () => {
  const t = transpostas(8)
  assert.equal(t.length, 28)
  assert.ok(t.every((x) => x.iguais))
})

test('matriz de transferencia, forca bruta e ramos concordam ate 5x5, inclusive por numero de pretas', () => {
  for (const c of confronto()) {
    assert.equal(c.transferencia, c.forcaBruta)
    assert.equal(c.transferencia, c.ramos)
    assert.equal(c.porPretasIgual, true)
  }
})

test('3x3 com numeros de 1 a 3: 1.584 tabuleiros de solucao unica', () => {
  assert.deepEqual(puzzles('tres'), { total: 19683, nenhuma: 15879, unica: 1584, varias: 2220, maior: 39, nos: 433155 })
})
