# CLAUDE.md — ORQUESTRA

Projeto acadêmico (PBL): gestão e acompanhamento de chamados operacionais, migrado de HTML/CSS/JS para React.
A referência acadêmica é `docs/conteúdo_consolidado.pdf`. Detalhes de rotas, dados e funcionalidades estão no `README.md`.

## Stack e restrições

- **Usar:** React, JSX, JavaScript, Vite, React Router (`createBrowserRouter`), Bootstrap 5 e CSS próprio.
- **Não usar:** TypeScript, Redux, Context API, custom hooks, `localStorage`, bibliotecas de estado ou de gráficos, nem novas dependências sem autorização.
- **Estado:** `useState` mais props. Gráficos são feitos em HTML/CSS (`components/backoffice/BarChart.jsx`).
- **Recursos fora do material acadêmico já usados:** `useParams`, `NavLink`, `Navigate`, `useLocation`, `onChange` em input controlado, `String.normalize` e a forma funcional do `useState` (`setX(anterior => ...)`). Use a forma funcional sempre que o novo estado depender do anterior. Antes de adicionar qualquer recurso novo fora do material, sinalize e justifique.
- **Estilo do código:** simples e didático, com comentários em português, sem acentos nos comentários.

## Arquitetura

- **Rotas** ficam só em `src/router.jsx`. Há duas árvores: `/` (`AppShellLayout`, Mobile) e `/backoffice` (`BackofficeLayout`, Desktop).
- **Alternância Mobile/Desktop é feita por rotas.** O usuário entra no Desktop pelo botão "Acessar BackOffice" (Menu Mais) e volta pelo link "Voltar ao app Mobile" (sidebar). **Não criar outro seletor nem modo automático** (decisão do Ciclo 2).
- **Estilos:**
  - `global.css`: tokens e base.
  - `bootstrap-overrides.css`: ajustes sobre o Bootstrap.
  - `mobile.css`: área Mobile.
  - `backoffice.css`: área Desktop. Todas as regras ficam dentro de `.app-root--backoffice`, para não colidir com `.card` e `.badge` do Bootstrap.
- **Funções puras** ficam em `src/utils/`: `filters.js` (criticidade, busca), `criticidade.js` (tabela de níveis) e `stats.js` (reservado para a E5).

## Dados: preservação obrigatória

- **Não alterar sem autorização expressa:** `src/data/chamados-mobile.json` (7 registros), `chamados-backoffice.json` (12), `insights.json` e `graficos-demonstrativos.json`. Verifique a integridade com MD5 a cada etapa.
- **Não inventar** campos, valores ou distribuições. Dado ausente aparece como ausente (por exemplo, "Informação não disponível").
- **Não misturar universos:**
  - 7 chamados Mobile;
  - 12 chamados da fila do Backoffice, que são um **recorte**;
  - KPIs de `insights.indicadores`, que são **demonstrativos** da operação consolidada (1.247 chamados);
  - gráficos do Painel, que são **simulados** (`graficos-demonstrativos.json`).
  Cálculos sobre os 12 registros nunca substituem os KPIs consolidados.
- **Divergências documentadas** (por exemplo, `slaCorrecao` e a harmonização 1.247 × 1.248) são exibidas, nunca resolvidas sem autorização.
- **Campo `hidden`** (Backoffice): é metadado legado da paginação "Ver mais" do protótipo. Preservar no JSON e não usar como regra de visibilidade.

## Decisões do Ciclo 2

- **Paginação:** 5 por página.
- **Busca:** ignora acentos, maiúsculas e espaços extras, sobre os 12 registros. Fica desabilitada no Painel.
- **Status:** rótulo "Supervisor", como no JSON.
- **SLA no Backoffice** (pelo `slaPercent`): Estourado ≥100%, Em risco >70% e <100%, No prazo ≤70%. Não há classificação de SLA no Mobile.
- **Resumo do recorte:** calculado sobre o resultado da busca e dos filtros, sempre mostrando o N considerado.
- **Os 11 chips de filtro do Painel** são apenas visuais e identificados como demonstrativos.
- **Fora do Ciclo 2:** seletor de período e ordenação.
- **Execução:** as etapas E1 a E5 são executadas uma de cada vez, **só com autorização expressa**. Não avançar para a etapa seguinte automaticamente.

## Preservação de arquivos

- Não remover o protótipo HTML/CSS original (raiz, `alerts/`, `critical/`, `high/`, `medio/`, `detalhes/`, `more/`, `backoffice/`) nem `docs/`.
- Só excluir arquivos depois de comprovar que não há referências a eles, e registrar a exclusão no `README.md`.

## Validação de cada etapa

1. `npm run lint` e `npm run build`.
2. MD5 dos 4 JSONs (devem bater com os valores registrados).
3. Testes funcionais no navegador (Edge headless; rotas a partir de `vite preview`).
4. Responsividade em 320, 360, 375, 414, 768, 1024 e 1440px, sem rolagem horizontal.
   - O Edge headless tem largura mínima de cerca de 500px. Para larguras menores, renderize a página dentro de um iframe servido na mesma origem.
   - A barra de rolagem vertical do iframe causa um falso positivo de rolagem horizontal a 320px. Use um iframe alto.
5. Regressão nas rotas Mobile, detalhe, Backoffice e 404.
6. Build e lint aprovados não substituem a validação visual.
