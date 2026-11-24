// A pagina: so desenho e clique. Gerar, resolver e conferir vem de hitori.js,
// o mesmo arquivo que os testes varrem.

import { gera, confere, sorteador } from './hitori.js'

const elTab = document.getElementById('tabuleiro')
const elEstado = document.getElementById('estado')
const elTam = document.getElementById('tamanho')

let n, grade, solucao, marca // marca: 0 nada, 1 preta, 2 circulo

function novo () {
  n = Number(elTam.value)
  const r = gera(n, sorteador(Math.floor(Math.random() * 2 ** 31)))
  grade = r.grade
  solucao = r.solucao
  marca = new Uint8Array(n * n)
  elEstado.textContent = ''
  desenha()
}

function desenha () {
  elTab.style.gridTemplateColumns = `repeat(${n}, 1fr)`
  elTab.style.width = `min(100%, ${n * 52}px)`
  elTab.innerHTML = ''
  for (let i = 0; i < n * n; i++) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'casa' + (marca[i] === 1 ? ' preta' : marca[i] === 2 ? ' circulo' : '')
    b.textContent = grade[i]
    b.setAttribute('aria-label', `linha ${Math.floor(i / n) + 1}, coluna ${(i % n) + 1}, ${grade[i]}`)
    b.addEventListener('click', () => {
      marca[i] = (marca[i] + 1) % 3
      desenha()
      const pretas = Uint8Array.from(marca, (m) => (m === 1 ? 1 : 0))
      if (confere(grade, n, pretas).ok) elEstado.innerHTML = '<span class="ok">Resolvido.</span> As três regras valem.'
      else elEstado.textContent = ''
    })
    elTab.appendChild(b)
  }
}

document.getElementById('novo').addEventListener('click', novo)
elTam.addEventListener('change', novo)
document.getElementById('conferir').addEventListener('click', () => {
  const pretas = Uint8Array.from(marca, (m) => (m === 1 ? 1 : 0))
  const r = confere(grade, n, pretas)
  elEstado.innerHTML = r.ok ? '<span class="ok">Resolvido.</span> As três regras valem.' : `<span class="aviso">Ainda não:</span> ${r.motivo}.`
})
document.getElementById('mostrar').addEventListener('click', () => {
  marca = Uint8Array.from(solucao, (p) => (p ? 1 : 0))
  desenha()
  elEstado.textContent = 'Esta é a única solução.'
})

novo()
