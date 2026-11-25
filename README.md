# ORQUESTRA — Gestão e acompanhamento de chamados operacionais

Projeto acadêmico (PBL) migrado de HTML/CSS/JS para **React + JSX**. A aplicação atual é inteiramente React; o protótipo HTML original foi removido do projeto (ver "Registro de limpeza").
Sem TypeScript, Redux, Context API, custom hooks ou bibliotecas de gráficos.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 + JSX | Componentes e telas (`useState` e props para o estado) |
| React Router 7 | Rotas com `createBrowserRouter` (`src/router.jsx`) |
| Vite 8 (`@vitejs/plugin-react`) | Servidor de desenvolvimento e build |
| Bootstrap 5.3 + CSS próprio | Estilos (`src/styles/`) |
| Font Awesome 7 (CDN, no `index.html`) | Ícones |
| oxlint | Verificação do código (`npm run lint`) |
| Node.js | Execução do Vite e do script que gera a base demonstrativa |

Os gráficos são feitos em HTML/CSS, sem biblioteca de gráficos.

## Como executar

```bash
npm install      # instala as dependências
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (pasta dist/)
npm run preview  # serve o build de produção localmente
npm run lint     # verificação com oxlint
```

Para regenerar a base demonstrativa do Painel Operacional (o resultado é sempre o mesmo arquivo):

```bash
node scripts/gerar-painel-demonstrativo.mjs
```

## Estrutura

```
src/
  main.jsx                 entrada: RouterProvider + estilos
  router.jsx               rotas (createBrowserRouter)
  layouts/                 AppShellLayout (Mobile) e BackofficeLayout
  pages/                   telas (Home, Alerts, Detail/*, More, Backoffice*, NotFound, RedirecionaCriticidade)
  components/              componentes reutilizáveis (lista de chamados, alertas, filtros, gráficos, KPIs)
  data/                    arquivos JSON (fonte dos dados exibidos)
  utils/                   funções puras e tabelas de apresentação
  styles/                  global, overrides do Bootstrap, mobile e backoffice
public/                    arquivos públicos (favicon.svg)
scripts/                   gerar-painel-demonstrativo.mjs (ferramenta de desenvolvimento; não é importada pela aplicação)
index.html                 entrada do Vite (carrega src/main.jsx)
vite.config.js             configuração do Vite (plugin React e separação das bibliotecas no build)
package.json               dependências e scripts npm
.oxlintrc.json             regras do lint
```

## Rotas

| Rota | Tela |
|---|---|
| `/` | Home: chamados com filtro de criticidade |
| `/alertas` | Alertas (chamados críticos) |
| `/criticidade/:nivel` | Compatibilidade: redireciona para a Home com o filtro aplicado |
| `/chamados/:id` → `resumo`, `linha-do-tempo`, `historico` | Detalhe do chamado |
| `/mais` | Menu Mais (com acesso destacado ao Backoffice) |
| `/backoffice` → `painel`, `chamados` | Painel Operacional e Gestão de Chamados |
| `*` | Página não encontrada |

## Alternância Mobile / Desktop

A alternância é feita **por rotas**, com escolha manual do usuário. Não há modo automático.

- **Mobile:** rotas de `/` (`AppShellLayout`). No desktop, aparece como uma coluna de 480px.
- **Desktop:** rotas de `/backoffice` (`BackofficeLayout`).
- **Para entrar no Desktop:** botão **"Acessar BackOffice"** no Menu Mais.
- **Para voltar ao Mobile:** **"Voltar ao app Mobile"** na sidebar.

A escolha fica registrada na própria rota e se mantém enquanto o usuário navega dentro de cada área.

## Ciclo 2 — funcionalidades

| Etapa | Funcionalidade | Situação |
|---|---|---|
| E1 | Busca na fila do Backoffice | Concluída |
| E2 | Filtros combináveis (status, prioridade, região) | Concluída |
| E3 | Paginação (5 por página) e tratamento do campo `hidden` | Pendente |
| E4 | Sinalização de risco de SLA | Pendente |
| E5 | Indicadores calculados do recorte | Pendente |
| EP1 + EP-R | Painel Operacional gerencial (base demonstrativa, filtros múltiplos, KPIs, gráficos e Performance por Região calculados) | Concluída |

### Busca (E1)

- **Onde:** campo na barra superior de **Backoffice › Chamados**. Os resultados atualizam enquanto o usuário digita.
- **Campos pesquisados** (todos existem em `chamados-backoffice.json`): `id` (aceita "#CH-…" ou só os números), `local`, `equipamento`, `ocorrencia`, `responsavel`, `statusLabel`, `prioridadeLabel` e `regiaoLabel`.
  Não existem nos registros os campos "cliente" e "contrato", por isso eles não são pesquisados.
- **Normalização** (`normalizarTexto` em `src/utils/filters.js`): ignora acentos, maiúsculas e espaços extras. Exemplo: "media" encontra "Média".
- **Universo:** os 12 registros completos. A busca não altera os registros, os KPIs consolidados nem o gráfico por região, que continua representando o recorte completo.
- **Sem resultado:** mostra uma mensagem com o termo pesquisado e o botão "Limpar busca". O rodapé informa "Mostrando N de 12 chamados da fila".
- **No Painel Operacional:** o campo aparece desabilitado com a dica "Busca disponível na fila de Chamados" (a tela não tem fila).
- **Estado:** `useState` em `BackofficeChamados.jsx`, passado à `BackofficeTopbar` por props (`busca`, `onBuscar`). O texto não é guardado ao sair da tela.

### Filtros combináveis (E2)

- **Onde:** botão de filtro da **Fila de chamados**. Ele abre e fecha o painel; com filtros ativos, mostra quantos grupos estão filtrando.
- **Grupos e opções:** extraídos dos próprios registros (`opcoesDoCampo` em `src/utils/filters.js`), com os rótulos do JSON. Nenhuma categoria foi criada.
  - Status: Aberto, Supervisor, Em atendimento.
  - Prioridade: Crítica, Alta, Média, Normal.
  - Região: Centro, Zona Sul, Zona Norte, Zona Leste, Zona Oeste.
  - Cada grupo tem a opção "Todos".
- **Regra:** os grupos combinam entre si e com a busca usando lógica **E**: `filtrarFila(buscar(chamados, busca), filtros)`.
- **"Limpar filtros":** volta todos os grupos para "Todos" e **mantém o texto da busca**.
- **Contador:** "Mostrando N de 12 chamados da fila" sempre que houver busca ou filtro ativo.
- **Sem resultado:** a mensagem indica o termo e/ou os filtros, com botões "Limpar busca" e/ou "Limpar filtros", conforme o que estiver ativo.
- **Recorte preservado:** KPIs consolidados, aviso de recorte e gráfico por região continuam representando os 12 registros.
- **Painel Operacional:** usa filtros próprios, descritos na seção "Painel Operacional (EP-R)". Os 11 chips antigos do protótipo foram substituídos.

### Painel Operacional (EP-R)

Todos os elementos analíticos do Painel usam a **mesma base** e os **mesmos registros filtrados**:
`indicadores = calcularIndicadores(filtrarPorSelecao(base, selecao))` (`src/utils/stats.js` e `src/utils/filters.js`).

- **Base:** `src/data/painel-demonstrativo.json`, com 1.247 chamados **fictícios** de jul–set 2025, IDs `PD-000001` a `PD-001247`.
  - É gerada por `node scripts/gerar-painel-demonstrativo.mjs`, que usa semente fixa (a mesma execução sempre produz o mesmo arquivo) e valida todas as regras antes de gravar.
  - Os rótulos ficam uma única vez em `documentacao.rotulos`, e campos que não se aplicam são omitidos (nunca viram zero).
  - Quantidades e regras estão em `documentacao`.
- **Filtros (seleção múltipla, só no Painel):** Status, Prioridade e Região.
  - **OU** dentro do grupo, **E** entre os grupos.
  - Clique marca ou desmarca a opção; "Todos" esvazia o grupo.
  - O contador mostra o número de **opções marcadas**.
  - O painel de filtros inicia aberto.
- **Seis KPIs** (calculados):

  | KPI | Cálculo |
  |---|---|
  | Total | quantidade de registros, com a variação do último mês com dados em relação ao anterior |
  | Abertas | Aberto + Aguardando supervisor |
  | Em atendimento | quantidade, com a nota "N críticas" = em atendimento **e** prioridade crítica |
  | Concluídas | quantidade, com o % do total |
  | TA médio | só registros com TA, mostrando n |
  | TB médio | só concluídos com TB, mostrando n |

- **Seis gráficos:** por mês e por tipo (cada um com a série "Reincidentes", que é um subconjunto **já incluído** no total), por status, por prioridade, por região e situação do SLA.
- **SLA** = (tempo utilizado ÷ prazo da prioridade) × 100. O tempo utilizado é o TB nos concluídos e o tempo decorrido nos demais.
  - Classes: **No prazo ≤ 70%**, **Em risco > 70% e < 100%**, **Estourado ≥ 100%**.
  - Os prazos (60 / 150 / 240 / 480 min) e as metas (TA 30 min, TB 2h) são **regras assumidas** da base demonstrativa, não parâmetros oficiais. Não se aplicam aos chamados reais da aba Chamados.
- **Performance por Região:** por região, mostra TA, TB, SLA no prazo (sobre os registros com SLA calculável), reincidência (sobre o total da região) e responsáveis distintos, sempre com o **n** de cada cálculo.
- **Sem resultado:** contagens mostram 0, médias e percentuais mostram "—", e os gráficos mostram "Sem dados para os filtros selecionados".
- **Referências demonstrativas:** Padrões e Recomendações vêm de `insights.json`, ficam em uma área separada e **não respondem aos filtros**.
- **Consequência da distribuição de status** (4 Aberto · 54 Aguardando supervisor · 21 Em atendimento · 1.168 Concluído, como no protótipo): poucas combinações com "Aberto" retornam registros.
- **Build:** o `vite.config.js` separa as bibliotecas (`manualChunks`) do código da aplicação, para que nenhum pacote ultrapasse o limite de aviso do Vite. Os dois pacotes carregam juntos.

## Origem dos dados

| Arquivo | Conteúdo | Natureza |
|---|---|---|
| `chamados-mobile.json` | 7 chamados do app Mobile (lista, alertas, detalhe, timeline, histórico, SLA) | Registros do protótipo. `slaCorrecao` documenta uma divergência de SLA, que é exibida sem ser resolvida |
| `chamados-backoffice.json` | 12 chamados da fila do Backoffice | Registros do protótipo. O gráfico "Chamados por região" é **calculado** a partir deles |
| `insights.json` | `indicadores` (fonte única dos KPIs do Backoffice), fluxo, eventos de integração, padrões, áreas, recomendações e opções do Menu Mais | **Demonstrativos**. Universo: operação consolidada. A fila de 12 chamados é um recorte e não é base dos KPIs. A harmonização 1.247 × 1.248 está documentada em `indicadores.documentacao` |
| `graficos-demonstrativos.json` | Valores dos 3 gráficos antigos do Painel Operacional | **Simulados**. Preservado, mas **não é mais usado** pelo Painel desde a EP-R |
| `painel-demonstrativo.json` | 1.247 chamados fictícios (jul–set 2025) que alimentam todos os KPIs, gráficos e a Performance por Região do Painel | **Demonstrativos**, gerados por script determinístico. Independentes das outras bases |

Os gráficos são HTML/CSS (`components/backoffice/BarChart.jsx`). A altura de cada barra é calculada a partir do valor recebido (`valor / maior valor × 100%`). Nenhum valor de negócio fica fixado no CSS.

**A base de 1.247 registros do Painel Operacional é demonstrativa:** os chamados são fictícios. Os prazos de SLA e as metas de TA/TB também são regras assumidas apenas para a demonstração, e nada disso representa a operação real.

Alguns campos dos JSONs originais (por exemplo, `slaPorOrigem` em `chamados-mobile.json`) citam caminhos de páginas do protótipo HTML, como `detalhes/chamado-resumo.html`. São referências históricas de onde cada valor foi obtido. A aplicação não abre esses arquivos, e eles podem ser consultados no histórico do Git (tag `pos-ep-r`), por exemplo com `git show pos-ep-r:detalhes/chamado-resumo.html`.

## Registro de limpeza (2026-11-24)

Antes de excluir cada arquivo, foi verificado que nenhum outro arquivo do projeto o referenciava.

| Removido | Motivo |
|---|---|
| `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg` | Resíduos do template Vite, sem referências |
| `src/index.css` | CSS do template, não importado; substituído por `styles/global.css` |
| `src/test2.css`, `src/test.txt`, `src/components/calls/test.txt` | Arquivos de teste temporários, sem referências |
| `_fix.cjs` | Script temporário inválido (`require(fs)`), sem uso; gerava os únicos avisos do lint |
| `dist/` | Build antigo e desatualizado (ignorado pelo git); é regenerado por `npm run build` |
| `src/pages/Criticality.jsx`, `src/components/CriticalityNav.jsx` | Substituídos pelo filtro na Home (`CriticalityFilter.jsx`) e por `RedirecionaCriticidade.jsx` |
| Dependências `@types/react`, `@types/react-dom` | Tipos para TypeScript; o projeto não usa TS (não há tsconfig/jsconfig) |

Mantidos naquela limpeza: o protótipo HTML/CSS original (removido depois, na limpeza de 2026-11-25), os JSONs, `public/favicon.svg` (referenciado no `index.html`) e `src/utils/stats.js` (hoje usado pelo Painel Operacional).

## Registro de limpeza (2026-11-25) — protótipo anterior ao React

Antes da remoção, foi criado o ponto de restauração `pos-ep-r` (commit `f8d4a6e`), que contém a EP-R e todos os arquivos abaixo. Nenhum deles era importado ou carregado pela aplicação React. As únicas referências eram textos históricos nos JSONs, comentários no CSS e a documentação.

| Removido | Motivo |
|---|---|
| `alerts/alertas.html`, `critical/critico-vermelho.html`, `high/alto-laranja.html`, `medio/medio-amarelo.html`, `medio/padrao-verde.html`, `more/mais.html` | Páginas do protótipo HTML, substituídas pelas telas React |
| `detalhes/chamado-resumo.html`, `detalhes/chamado-linha-do-tempo.html`, `detalhes/chamado-historico.html` | Páginas do protótipo, substituídas por `pages/Detail/*` |
| `backoffice/chamados.html`, `backoffice/painel-operacional.html`, `backoffice/chamados.css`, `backoffice/painel-operacional.css` | Páginas e estilos do protótipo do Backoffice, substituídos por `BackofficeChamados.jsx`, `BackofficePainel.jsx` e `styles/backoffice.css`. Também causavam um defeito no `npm run dev`: o acesso direto a `/backoffice/chamados` carregava o HTML antigo em vez da aplicação React |
| `styles.css` (raiz) | Estilo do protótipo, migrado para `src/styles/` |
| Pastas `alerts/`, `critical/`, `high/`, `medio/`, `more/`, `detalhes/`, `backoffice/` | Ficaram vazias |
| Pastas vazias `src/components/common/`, `detail/` e `layout/` | Sem conteúdo |
| `CLAUDE.md` | Arquivo de instruções do assistente, que deixou de ser necessário. As regras relevantes estão neste README |
| `docs/` (material acadêmico em PDF) | Removido do projeto por decisão do autor |
