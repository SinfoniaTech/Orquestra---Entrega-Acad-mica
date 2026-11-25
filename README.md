# ORQUESTRA — Gestão e acompanhamento de chamados operacionais

Projeto acadêmico (PBL) migrado de HTML/CSS/JS para **React + JSX**, com Vite, React Router, Bootstrap 5 e CSS próprio.
Sem TypeScript, Redux, Context API, custom hooks ou bibliotecas de gráficos.

## Como executar

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (pasta dist/)
npm run lint     # verificação com oxlint
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
docs/                      material acadêmico de referência
*.html, styles.css, alerts/, critical/, high/, medio/, detalhes/, more/, backoffice/
                           protótipo HTML original, mantido como referência
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
- **Painel Operacional:** o botão de filtro abre os 11 chips do protótipo (`insights.painelOperacional.filtrosHistorico`), **desabilitados** e com a etiqueta "Demonstrativo — sem dados funcionais". Os registros não têm dados de histórico que permitam filtrar.

## Origem dos dados

| Arquivo | Conteúdo | Natureza |
|---|---|---|
| `chamados-mobile.json` | 7 chamados do app Mobile (lista, alertas, detalhe, timeline, histórico, SLA) | Registros do protótipo. `slaCorrecao` documenta uma divergência de SLA, que é exibida sem ser resolvida |
| `chamados-backoffice.json` | 12 chamados da fila do Backoffice | Registros do protótipo. O gráfico "Chamados por região" é **calculado** a partir deles |
| `insights.json` | `indicadores` (fonte única dos KPIs do Backoffice), fluxo, eventos de integração, padrões, áreas, recomendações e opções do Menu Mais | **Demonstrativos**. Universo: operação consolidada. A fila de 12 chamados é um recorte e não é base dos KPIs. A harmonização 1.247 × 1.248 está documentada em `indicadores.documentacao` |
| `graficos-demonstrativos.json` | Valores dos 3 gráficos do Painel Operacional | **Simulados**, criados porque o original não tinha valores. Método e verificações de coerência estão no bloco `documentacao` |

Os gráficos são HTML/CSS (`components/backoffice/BarChart.jsx`). A altura de cada barra é calculada a partir do valor recebido (`valor / maior valor × 100%`). Nenhum valor de negócio fica fixado no CSS.

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

Mantidos de propósito: o protótipo HTML/CSS original, os JSONs, `docs/`, `public/favicon.svg` (referenciado no `index.html`) e `src/utils/stats.js` (reservado para o cálculo de indicadores).
