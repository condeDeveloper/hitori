// O juiz das formas. Nao importa nada de formas.js e conta de dois jeitos
// burros, cada um ate onde aguenta:
//
//   forcaBruta   todas as 2^casas mascaras, uma por uma (ate 25 casas)
//   porRamos     so as mascaras sem pretas vizinhas, geradas casa a casa, e a
//                regra das brancas conferida no fim de cada uma (ate ~36 casas)
//
// As duas conferem a regra das brancas com uma busca em largura de verdade,
// casa por casa, sem rotulo nem fronteira.

function brancasLigadas (pretas, A, L) {
  const n = A * L
  let inicio = -1
  let brancas = 0
  for (let i = 0; i < n; i++) if (!pretas[i]) { brancas++; if (inicio < 0) inicio = i }
  if (brancas === 0) return false
  const visto = new Uint8Array(n)
  const fila = [inicio]
  visto[inicio] = 1
  let achadas = 1
  while (fila.length) {
    const i = fila.pop()
    const r = Math.floor(i / L)
    const c = i % L
    const viz = []
    if (r > 0) viz.push(i - L)
    if (r < A - 1) viz.push(i + L)
    if (c > 0) viz.push(i - 1)
    if (c < L - 1) viz.push(i + 1)
    for (const j of viz) {
      if (!visto[j] && !pretas[j]) { visto[j] = 1; achadas++; fila.push(j) }
    }
  }
  return achadas === brancas
}

export function forcaBruta (A, L) {
  const n = A * L
  if (n > 25) throw new Error('casas demais para a forca bruta')
  const pretas = new Uint8Array(n)
  let total = 0
  let independentes = 0
  for (let m = 0; m < 2 ** n; m++) {
    for (let i = 0; i < n; i++) pretas[i] = (m >> i) & 1
    let ok = true
    for (let i = 0; i < n && ok; i++) {
      if (!pretas[i]) continue
      if (i % L < L - 1 && pretas[i + 1]) ok = false
      if (i + L < n && pretas[i + L]) ok = false
    }
    if (!ok) continue
    independentes++
    if (brancasLigadas(pretas, A, L)) total++
  }
  return { total, independentes }
}

export function porRamos (A, L) {
  const n = A * L
  const pretas = new Uint8Array(n)
  let total = 0
  let independentes = 0
  const porPretas = []
  function vai (i, k) {
    if (i === n) {
      independentes++
      if (brancasLigadas(pretas, A, L)) { total++; porPretas[k] = (porPretas[k] || 0) + 1 }
      return
    }
    vai(i + 1, k)
    const r = Math.floor(i / L)
    const c = i % L
    if ((c === 0 || !pretas[i - 1]) && (r === 0 || !pretas[i - L])) {
      pretas[i] = 1
      vai(i + 1, k + 1)
      pretas[i] = 0
    }
  }
  vai(0, 0)
  return { total, independentes, porPretas: Array.from(porPretas, (x) => x || 0) }
}

// Todas as formas de um tabuleiro A x L, como listas de casas pretas. Para o
// juiz do resolvedor.
export function listaFormas (A, L) {
  const n = A * L
  const pretas = new Uint8Array(n)
  const r = []
  function vai (i) {
    if (i === n) {
      if (brancasLigadas(pretas, A, L)) {
        const ps = []
        for (let k = 0; k < n; k++) if (pretas[k]) ps.push(k)
        r.push(ps)
      }
      return
    }
    vai(i + 1)
    if ((i % L === 0 || !pretas[i - 1]) && (i < L || !pretas[i - L])) {
      pretas[i] = 1
      vai(i + 1)
      pretas[i] = 0
    }
  }
  vai(0)
  return r
}

// Quantas solucoes um tabuleiro tem, testando forma por forma: a forma serve
// se nenhuma linha ou coluna repete numero entre as brancas.
export function resolvePorFormas (grade, n, formas) {
  let total = 0
  const preta = new Uint8Array(n * n)
  for (const f of formas) {
    for (const i of f) preta[i] = 1
    let ok = true
    for (let k = 0; k < n && ok; k++) {
      let vl = 0
      let vc = 0
      for (let j = 0; j < n; j++) {
        const a = k * n + j
        const b = j * n + k
        if (!preta[a]) { const bit = 1 << grade[a]; if (vl & bit) { ok = false; break } vl |= bit }
        if (!preta[b]) { const bit = 1 << grade[b]; if (vc & bit) { ok = false; break } vc |= bit }
      }
    }
    if (ok) total++
    for (const i of f) preta[i] = 0
  }
  return total
}
