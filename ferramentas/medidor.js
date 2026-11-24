#!/usr/bin/env node
// O medidor. Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js              as tabelas rapidas
//   node ferramentas/medidor.js formas       formas de 1x1 a 13x13
//   node ferramentas/medidor.js maximos      o maximo de pretas de 2x2 a 10x10
//   node ferramentas/medidor.js transpostas  A x L contra L x A ate 8
//   node ferramentas/medidor.js juiz         os tres contadores juntos ate 6x6
//   node ferramentas/medidor.js puzzles      os tabuleiros pequenos inteiros
//   node ferramentas/medidor.js juizpuzzles  o resolvedor contra forma por forma (meio minuto)
//   node ferramentas/medidor.js catorze      o 14x14 (meio minuto)

import { quadrados, maximos, transpostas, confronto, confrontoSeis, puzzles, confrontoPuzzles } from '../js/medidas.js'

const n = (x) => x.toLocaleString('pt-BR')
const pc = (a, b) => (100 * Number(a) / Number(b)).toFixed(2).replace('.', ',') + '%'

function tFormas (ate = 13) {
  console.log('\n== formas de solucao de Hitori em n x n ==')
  console.log('   n  formas  /  sem pretas vizinhas  =  fracao')
  for (const q of quadrados(1, ate)) {
    console.log(`  ${String(q.n).padStart(2)}  ${q.formas}  /  ${q.independentes}  =  ${pc(q.formas * 1000000n / q.independentes, 1000000)}`)
  }
}

function tMaximos () {
  console.log('\n== o maximo de pretas e quantas formas chegam nele ==')
  for (const m of maximos(2, 10)) console.log(`  ${String(m.n).padStart(2)}x${m.n}: ${m.maxPretas} pretas, ${n(Number(m.quantas))} formas`)
}

function tTranspostas () {
  const t = transpostas(8)
  const iguais = t.filter((x) => x.iguais).length
  console.log(`\n== A x L contra L x A, de 1 a 8: ${iguais} de ${t.length} pares iguais ==`)
}

function tJuiz () {
  console.log('\n== matriz de transferencia contra forca bruta contra ramos ==')
  for (const c of confronto()) {
    console.log(`  ${c.a}x${c.l}: ${n(c.transferencia)} / ${n(c.forcaBruta)} / ${n(c.ramos)}  (independentes ${n(c.independentes)}; contagem por pretas igual: ${c.porPretasIgual ? 'sim' : 'NAO'})`)
  }
  const s = confrontoSeis()
  console.log(`  6x6: ${n(s.transferencia)} / (forca bruta nao alcanca) / ${n(s.ramos)}  (independentes ${n(s.independentes)}; contagem por pretas igual: ${s.porPretasIgual ? 'sim' : 'NAO'})`)
}

function tPuzzles () {
  console.log('\n== os tabuleiros pequenos inteiros ==')
  for (const [nome, rot] of [['tres', '3x3, numeros de 1 a 3'], ['quatro', '4x4, cada linha uma permutacao']]) {
    const p = puzzles(nome)
    console.log(`  ${rot}: ${n(p.total)} tabuleiros`)
    console.log(`     solucao unica ${n(p.unica)} (${pc(p.unica, p.total)}), nenhuma ${n(p.nenhuma)} (${pc(p.nenhuma, p.total)}), varias ${n(p.varias)} (${pc(p.varias, p.total)}); o maximo e ${p.maior}`)
  }
}

function tJuizPuzzles () {
  console.log('\n== o resolvedor contra o juiz que testa forma por forma ==')
  for (const nome of ['tres', 'quatro']) {
    const c = confrontoPuzzles(nome)
    console.log(`  ${nome}: ${n(c.total)} tabuleiros, ${c.formas} formas cada, ${c.dif} divergencias`)
  }
}

function tCatorze () {
  const t = Date.now()
  const q = quadrados(14, 14)[0]
  console.log(`\n== 14x14 ==\n  ${q.formas} formas, ${q.independentes} independentes (${Math.round((Date.now() - t) / 1000)} s)`)
}

const tabelas = { formas: () => tFormas(), maximos: tMaximos, transpostas: tTranspostas, juiz: tJuiz, puzzles: tPuzzles, juizpuzzles: tJuizPuzzles, catorze: tCatorze }
const pedidas = process.argv.slice(2)
for (const k of pedidas.length ? pedidas : ['formas', 'maximos', 'transpostas', 'juiz', 'puzzles']) {
  if (!tabelas[k]) { console.error('tabela desconhecida: ' + k); process.exit(1) }
  tabelas[k]()
}
