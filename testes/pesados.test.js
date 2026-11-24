// O 6x6 pelos ramos, o 4x4 de linhas permutadas inteiro e o 14x14.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { confrontoSeis, puzzles, quadrados } from '../js/medidas.js'

const T = { timeout: 900000 }

test('6x6: os ramos contam as mesmas 1.646.096 formas, inclusive por numero de pretas', T, () => {
  assert.deepEqual(confrontoSeis(), { ramos: 1646096, transferencia: 1646096, independentes: 5598861, porPretasIgual: true })
})

test('4x4 com cada linha uma permutacao: 10.848 de 331.776 com solucao unica', T, () => {
  const p = puzzles('quatro')
  assert.equal(p.total, 331776)
  assert.equal(p.unica, 10848)
  assert.equal(p.nenhuma, 221568)
  assert.equal(p.varias, 99360)
  assert.equal(p.maior, 562)
})

test('14x14', T, () => {
  const q = quadrados(14, 14)[0]
  assert.equal(String(q.formas), '8951629622004424856628885578891048')
})
