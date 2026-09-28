# PDM · Programação para Dispositivos Móveis · DAW 2 · 2026/27

Site das aulas da UC, em HTML puro, sem build. Publicado tal como está pelo GitHub Pages.

- `index.html`: calendário das 37 aulas por semana (gerado por `../tools/gen_index.py` a partir de `../tools/plano.py`), programa e avaliação.
- `guia-instalacao.html`, `projeto.html`, `avaliacao.html`, `api.html`.
- `aulas/aula-NN.html`: uma página por aula (teoria + prática).
- `assets/style.css` e `assets/app.js`: o único CSS e JS partilhados.

Para ver localmente basta abrir `index.html` no browser. Para publicar: Settings → Pages → Deploy from branch `main`, pasta `/ (root)`.

## Modo docente

As notas do docente dentro dos slides (`<aside class="notes">`) só aparecem em modo docente. Ativa-se uma vez abrindo qualquer aula com `?docente` no URL (por exemplo `aulas/aula-01.html?docente`); fica guardado no browser. Desativa-se com `?docente=0`. Nesse modo aparece o botão **N** na barra e a tecla `n` mostra ou esconde as notas. Os alunos não veem o botão, e as notas nunca aparecem no modo documento nem na impressão sem estarem ligadas. As notas estão no HTML, por isso quem ver o código-fonte consegue lê-las.
