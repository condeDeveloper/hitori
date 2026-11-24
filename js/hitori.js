// O Hitori em si: resolver e gerar. ESM puro, sem DOM.
//
// Um tabuleiro e uma lista de n*n numeros, lida linha a linha. Uma solucao
// pinta casas de preto cumprindo as tres regras:
//
//   1. numa linha ou coluna, nenhum numero se repete entre as casas brancas;
//   2. duas pretas nunca se encostam pelo lado;
//   3. as brancas formam um pedaco so.
//
// O resolvedor decide casa a casa, em ordem de leitura, com poda pelas regras
// 1 e 2, e pela 3 de um jeito barato: uma casa branca que fica cercada por
// pretas e pela borda, sem nenhuma vizinha ainda por decidir, isola um pedaco.

export function resolve (grade, n, { limite = Infinity } = {}) {
  const N = n * n
  const preta = new Uint8Array(N)
  const decidida = new Uint8Array(N)
  // quantas brancas de cada numero em cada linha e coluna
  const linha = Array.from({ length: n }, () => new Uint8Array(n + 1))
  const coluna = Array.from({ length: n }, () => new Uint8Array(n + 1))
  let total = 0
  let primeira = null
  let nos = 0

  const vizinhas = (i) => {
    const r = Math.floor(i / n)
    const c = i % n
    const v = []
    if (r > 0) v.push(i - n)
    if (r < n - 1) v.push(i + n)
    if (c > 0) v.push(i - 1)
    if (c < n - 1) v.push(i + 1)
    return v
  }
  const VIZ = Array.from({ length: N }, (_, i) => vizinhas(i))

  function ligadas () {
    let ini = -1
    let brancas = 0
    for (let i = 0; i < N; i++) if (!preta[i]) { brancas++; if (ini < 0) ini = i }
    const visto = new Uint8Array(N)
    const pilha = [ini]
    visto[ini] = 1
    let achou = 1
    while (pilha.length) {
      const i = pilha.pop()
      for (const j of VIZ[i]) if (!visto[j] && !preta[j]) { visto[j] = 1; achou++; pilha.push(j) }
    }
    return achou === brancas
  }

  // a casa i, ja decidida branca, ficou presa? (todas as vizinhas decididas e
  // pretas) Isso so e permitido se ela for a unica branca, o que nao acontece
  // em tabuleiro de 2x2 para cima.
  const presa = (i) => !preta[i] && decidida[i] && VIZ[i].every((j) => decidida[j] && preta[j])

  function vai (i) {
    nos++
    if (total >= limite) return
    if (i === N) {
      if (ligadas()) {
        total++
        if (!primeira) primeira = Array.from(preta)
      }
      return
    }
    const r = Math.floor(i / n)
    const c = i % n
    const v = grade[i]
    // branca
    if (linha[r][v] === 0 && coluna[c][v] === 0) {
      linha[r][v]++; coluna[c][v]++
      decidida[i] = 1
      vai(i + 1)
      decidida[i] = 0
      linha[r][v]--; coluna[c][v]--
    }
    // preta
    if ((c === 0 || !preta[i - 1]) && (r === 0 || !preta[i - n])) {
      preta[i] = 1
      decidida[i] = 1
      // as vizinhas de cima e da esquerda ja estao decididas: nao podem ficar presas
      const cima = r > 0 ? i - n : -1
      const esq = c > 0 ? i - 1 : -1
      if (!(cima >= 0 && presa(cima)) && !(esq >= 0 && presa(esq))) vai(i + 1)
      preta[i] = 0
      decidida[i] = 0
    }
  }
  vai(0)
  return { total, primeira, nos }
}

// Um gerador pseudoaleatorio pequeno e com semente, para os testes
// reproduzirem o mesmo tabuleiro.
export function sorteador (semente) {
  let s = semente >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function embaralha (v, rnd) {
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[v[i], v[j]] = [v[j], v[i]]
  }
  return v
}

// Gera um tabuleiro com solucao unica:
//   1. um quadrado latino embaralhado (cada numero uma vez por linha e coluna);
//   2. uma mascara de pretas valida, crescendo ao acaso;
//   3. cada preta recebe um numero que ja aparece branco na linha ou coluna
//      dela, para que deixa-la branca quebre a regra 1;
//   4. o resolvedor confere que a solucao e unica; se nao for, tenta de novo.
export function gera (n, rnd) {
  for (let tentativa = 1; ; tentativa++) {
    const lin = embaralha([...Array(n).keys()], rnd)
    const col = embaralha([...Array(n).keys()], rnd)
    const sim = embaralha([...Array(n).keys()].map((x) => x + 1), rnd)
    const grade = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) grade.push(sim[(lin[r] + col[c]) % n])
    const preta = new Uint8Array(n * n)
    for (const i of embaralha([...Array(n * n).keys()], rnd)) {
      if (rnd() < 0.35) continue
      const r = Math.floor(i / n)
      const c = i % n
      const vizPreta = (r > 0 && preta[i - n]) || (r < n - 1 && preta[i + n]) || (c > 0 && preta[i - 1]) || (c < n - 1 && preta[i + 1])
      if (vizPreta) continue
      preta[i] = 1
      if (!brancasLigadas(preta, n)) preta[i] = 0
    }
    for (let i = 0; i < n * n; i++) {
      if (!preta[i]) continue
      const r = Math.floor(i / n)
      const c = i % n
      const opcoes = new Set()
      for (let k = 0; k < n; k++) {
        if (!preta[r * n + k]) opcoes.add(grade[r * n + k])
        if (!preta[k * n + c]) opcoes.add(grade[k * n + c])
      }
      const lista = [...opcoes]
      grade[i] = lista[Math.floor(rnd() * lista.length)]
    }
    const s = resolve(grade, n, { limite: 2 })
    if (s.total === 1) return { grade, solucao: s.primeira, tentativas: tentativa }
  }
}

export function brancasLigadas (preta, n) {
  const N = n * n
  let ini = -1
  let brancas = 0
  for (let i = 0; i < N; i++) if (!preta[i]) { brancas++; if (ini < 0) ini = i }
  if (!brancas) return false
  const visto = new Uint8Array(N)
  const pilha = [ini]
  visto[ini] = 1
  let achou = 1
  while (pilha.length) {
    const i = pilha.pop()
    const r = Math.floor(i / n)
    const c = i % n
    for (const j of [r > 0 ? i - n : -1, r < n - 1 ? i + n : -1, c > 0 ? i - 1 : -1, c < n - 1 ? i + 1 : -1]) {
      if (j >= 0 && !visto[j] && !preta[j]) { visto[j] = 1; achou++; pilha.push(j) }
    }
  }
  return achou === brancas
}

// O que o jogador marcou esta certo? Confere as tres regras, sem olhar a
// solucao guardada: qualquer pintura que cumpra as regras e aceita.
export function confere (grade, n, preta) {
  for (let i = 0; i < n * n; i++) {
    if (!preta[i]) continue
    const r = Math.floor(i / n)
    const c = i % n
    if ((c < n - 1 && preta[i + 1]) || (r < n - 1 && preta[i + n])) return { ok: false, motivo: 'duas pretas se encostam' }
  }
  for (let k = 0; k < n; k++) {
    const vl = new Set()
    const vc = new Set()
    for (let j = 0; j < n; j++) {
      const a = k * n + j
      const b = j * n + k
      if (!preta[a]) { if (vl.has(grade[a])) return { ok: false, motivo: 'número repetido numa linha' }; vl.add(grade[a]) }
      if (!preta[b]) { if (vc.has(grade[b])) return { ok: false, motivo: 'número repetido numa coluna' }; vc.add(grade[b]) }
    }
  }
  if (!brancasLigadas(preta, n)) return { ok: false, motivo: 'as brancas estão separadas' }
  return { ok: true }
}
