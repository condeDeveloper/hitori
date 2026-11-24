# Hitori

Hitori jogável e as formas de toda solução contadas até 14×14, em JavaScript puro, sem dependência nenhuma.

Pinte casas de preto até que:

1. nenhum número se repita numa linha ou coluna entre as casas brancas;
2. duas pretas nunca se encostem pelo lado;
3. as brancas formem um pedaço só, ligado pelos lados.

**Página jogável:** <https://condedeveloper.github.io/hitori/>

---

## Os quatro achados

**1. As formas de toda solução, contadas até 14×14.** As regras 2 e 3 não olham os números. Então existe um conjunto de **formas** (máscaras de pretas sem vizinhas e com as brancas ligadas), e toda solução de todo Hitori é uma delas. No 5×5 são **20.297**, no 10×10 **208.786.414.361.204.882**, no 14×14 **8.951.629.622.004.424.856.628.885.578.891.048**. A matriz de transferência bate com a força bruta (todas as 2²⁵ máscaras) até o 5×5 e com uma busca por ramos até o 6×6, inclusive na contagem separada por número de pretas.

**2. O máximo de pretas tem uma forma só no 3×3, no 5×5 e no 7×7, e no 9×9 são 1.952.** No 3×3 cabem 4 pretas, de um jeito só; no 5×5, 9; no 7×7, 17, sempre de um jeito só. Parecia regra dos ímpares. No 9×9 o máximo de **27 pretas aparece em 1.952 formas**.

**3. A regra das brancas ligadas vai engolindo quase tudo.** Das máscaras sem pretas vizinhas, a fração com as brancas ligadas cai de **36,61%** no 5×5 para **10,28%** no 10×10 e **3,83%** no 13×13.

**4. Quase todo tabuleiro pequeno não tem solução, e um quadrado latino tem todas.** Dos **19.683** tabuleiros 3×3 com números de 1 a 3, só **8,05%** têm solução única e **80,67%** não têm nenhuma. Nos **331.776** tabuleiros 4×4 em que cada linha é uma permutação, a solução única cai para **3,27%**. E um quadrado latino, em que nada se repete, aceita **todas as 562 formas**: sem repetição não há o que pintar, e qualquer pintura válida vale.

---

## As tabelas

Todos os números abaixo saem de `node ferramentas/medidor.js` e estão presos em `testes/`. Nenhum foi digitado à mão.

### As formas de n×n

| n | formas | sem pretas vizinhas | fração com brancas ligadas |
| --- | --- | --- | --- |
| 1 | 1 | 2 | 50,00% |
| 2 | 5 | 7 | 71,43% |
| 3 | 39 | 63 | 61,90% |
| 4 | 562 | 1.234 | 45,54% |
| 5 | 20.297 | 55.447 | 36,61% |
| 6 | 1.646.096 | 5.598.861 | 29,40% |
| 7 | 296.058.640 | 1.280.128.950 | 23,13% |
| 8 | 118.930.018.898 | 660.647.962.955 | 18,00% |
| 9 | 105.847.803.502.669 | 770.548.397.261.707 | 13,74% |
| 10 | 208.786.414.361.204.882 | 2.030.049.051.145.980.050 | 10,28% |
| 11 | 912.108.074.417.652.669.264 | 12.083.401.651.433.651.945.979 | 7,55% |
| 12 | 8.821.565.703.462.781.281.195.276 | 162.481.813.349.792.588.536.582.997 | 5,43% |
| 13 | 188.874.908.013.037.706.102.773.241.824 | 4.935.961.285.224.791.538.367.780.371.090 | 3,83% |
| 14 | 8.951.629.622.004.424.856.628.885.578.891.048 | | |

Os retângulos `A×L` e `L×A` dão o mesmo número nos 28 pares de 1 a 8. A matriz de transferência anda com fronteiras de larguras diferentes nos dois casos, então a igualdade não vem de graça.

### O máximo de pretas

| tabuleiro | máximo de pretas | formas com o máximo |
| --- | --- | --- |
| 2×2 | 1 | 4 |
| 3×3 | 4 | **1** |
| 4×4 | 5 | 36 |
| 5×5 | 9 | **1** |
| 6×6 | 12 | 104 |
| 7×7 | 17 | **1** |
| 8×8 | 21 | 8.896 |
| 9×9 | 27 | **1.952** |
| 10×10 | 33 | 168.960 |

A contagem por número de pretas é conferida pelo juiz até o 6×6. Do 7×7 em diante ela vem só da matriz de transferência, a mesma que bate com o juiz em todos os tamanhos menores.

### Os três contadores

| tabuleiro | matriz de transferência | força bruta | ramos |
| --- | --- | --- | --- |
| 2×2 | 5 | 5 | 5 |
| 3×3 | 39 | 39 | 39 |
| 3×4 | 121 | 121 | 121 |
| 4×4 | 562 | 562 | 562 |
| 4×5 | 2.749 | 2.749 | 2.749 |
| 5×5 | 20.297 | 20.297 | 20.297 |
| 6×6 | 1.646.096 | não alcança (2³⁶ máscaras) | 1.646.096 |

### Os tabuleiros pequenos inteiros

| domínio | tabuleiros | solução única | nenhuma | várias | mais soluções |
| --- | --- | --- | --- | --- | --- |
| 3×3, números de 1 a 3 | 19.683 | 1.584 (8,05%) | 15.879 (80,67%) | 2.220 (11,28%) | 39 |
| 4×4, cada linha uma permutação | 331.776 | 10.848 (3,27%) | 221.568 (66,78%) | 99.360 (29,95%) | 562 |

O resolvedor (busca casa a casa com poda) concorda com o juiz que testa forma por forma em **todos** os tabuleiros dos dois domínios.

---

## Como funciona

**As formas** (`js/formas.js`) são contadas por matriz de transferência. O tabuleiro é varrido casa a casa, e o estado é a fronteira: a última casa vista de cada coluna, preta ou branca, e as brancas com um rótulo de componente. Duas brancas com o mesmo rótulo já estão ligadas por um caminho branco atrás da fronteira. O ponto delicado é quando um rótulo some da fronteira: aquele pedaço branco fechou. Isso só é permitido se ele for o único pedaço branco do tabuleiro inteiro, então todas as outras casas da fronteira têm de ser pretas, e dali para frente não pode aparecer branco nenhum. As contas são em `BigInt`: o 10×10 já passa de 2⁵³.

**O juiz** (`js/juiz.js`) não importa nada da matriz. A força bruta passa por todas as 2^casas máscaras; a busca por ramos gera só as que não têm pretas vizinhas e confere as brancas no fim. As duas conferem a ligação com uma busca em largura de verdade, casa por casa.

**O gerador da página** sorteia um quadrado latino, cresce uma máscara de pretas válida ao acaso, troca o número de cada preta por um que já aparece branco na linha ou na coluna dela, e pede ao resolvedor que confirme que a solução é única. Se não for, tenta de novo.

---

## O que as medidas me corrigiram

- **Escrevi o 14×14 no teste antes de medir.** Pus no arquivo de testes pesados um número de 34 algarismos que não tinha saído de programa nenhum, para preencher depois. O medidor deu outro, `8951629622004424856628885578891048`, e o teste foi corrigido pelo programa antes da primeira rodada. É exatamente o erro que o arquivo de medidas existe para impedir.

---

## Como rodar

Precisa de Node 20 ou mais novo. Sem dependência nenhuma.

```bash
npm test                              # a suíte inteira
npm run medir                         # as tabelas rápidas
node ferramentas/medidor.js maximos   # uma tabela só
node ferramentas/medidor.js catorze   # o 14x14
```

## Licença

MIT
