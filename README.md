# PDM · Programação para Dispositivos Móveis · DAW 2 · 2026/27

Site das aulas da UC, em HTML puro, sem build. Publicado tal como está pelo GitHub Pages.

- `index.html`: calendário das 37 aulas por semana (gerado por `../pdm-tools/gen_index.py` a partir de `../pdm-tools/plano.py`), programa e avaliação.
- `guia-instalacao.html`, `projeto.html`, `avaliacao.html`, `api.html`.
- `aulas/aula-NN.html`: uma página por aula (teoria + prática).
- `assets/style.css` e `assets/app.js`: o único CSS e JS partilhados.

- `en/`: a versão em inglês, espelho do site com os mesmos nomes de ficheiro (`en/index.html`, `en/aulas/aula-NN.html`, …). Usa os mesmos `assets/`.

Para ver localmente basta abrir `index.html` no browser. Para publicar: Settings → Pages → Deploy from branch `main`, pasta `/ (root)`.

## Notas do docente

As notas do docente dentro dos slides (`<aside class="notes">`) estão escondidas por defeito. O botão **N** na barra, ou a tecla `n`, mostra-as e esconde-as em qualquer aula. Não há modo docente: o botão está visível para toda a gente, alunos incluídos. As notas nunca aparecem no modo documento nem na impressão sem estarem ligadas.

## Versão em inglês

Cada página tem um botão **EN** / **PT** no cabeçalho que abre a mesma página na outra língua (o `app.js` troca `…/aulas/aula-07.html` por `…/en/aulas/aula-07.html`). O `app.js` escolhe os textos da interface pelo `lang` do `<html>`.

- `en/index.html` é gerado pelo `gen_index.py`, com os títulos e sumários de `../pdm-tools/plano_en.py`.
- As outras páginas de `en/` são traduções feitas à mão das páginas em português. Quando uma página em português muda, a de `en/` tem de ser atualizada também. As regras de tradução, os títulos e o glossário do código estão em `../pdm-tools/EN_GUIDE.md`.
- Na versão inglesa todo o código está em inglês (identificadores, comentários, nomes de ficheiros, rotas e textos da app). Ficam como estão os nomes que existem nos repositórios publicados: `pdm-aula-NN`, `starter/`, `solucao/`, os branches `passo-N` e o código das aulas 5 a 7.
