// O resolvedor contra o juiz que testa forma por forma, nos dois dominios
// inteiros. Meio minuto: roda UMA vez, no job das tabelas.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { confrontoPuzzles } from '../js/medidas.js'

test('o resolvedor concorda com o juiz em todos os tabuleiros dos dois dominios', { timeout: 1800000 }, () => {
  assert.deepEqual(confrontoPuzzles('tres'), { total: 19683, dif: 0, formas: 39 })
  assert.deepEqual(confrontoPuzzles('quatro'), { total: 331776, dif: 0, formas: 562 })
})
