/* src/utils/filters.js */
/* Funcoes puras de filtragem (recebem dados e devolvem uma nova lista, sem alterar o original). */

// Devolve os chamados do nivel informado ("critica", "alta", "media" ou "normal").
// Sem nivel (null), devolve a lista completa.
export function filtrarPorCriticidade(chamados, nivel) {
  if (!nivel) return chamados
  return chamados.filter((chamado) => chamado.prioridade === nivel)
}

// Prepara um texto para comparacao na busca:
//  - normalize('NFD') separa a letra do acento ("é" vira "e" + acento) e o replace remove os acentos;
//  - toLowerCase ignora maiusculas/minusculas;
//  - o replace(/\s+/g, ' ') junta espacos repetidos e o trim remove espacos nas pontas.
export function normalizarTexto(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Campos da fila do Backoffice que participam da busca (todos existem em chamados-backoffice.json)
const CAMPOS_BUSCA = [
  'id',
  'local',
  'equipamento',
  'ocorrencia',
  'responsavel',
  'statusLabel',
  'prioridadeLabel',
  'regiaoLabel',
]

// Devolve os chamados em que algum campo pesquisavel contem o termo digitado.
// O "#" inicial e ignorado, para aceitar "#CH-0008148" (o ID e exibido com "#" na tabela).
// Termo vazio devolve a lista completa.
export function buscar(chamados, termo) {
  const termoNormalizado = normalizarTexto(termo).replace(/^#/, '')
  if (termoNormalizado === '') return chamados

  return chamados.filter((chamado) =>
    CAMPOS_BUSCA.some((campo) => normalizarTexto(chamado[campo]).includes(termoNormalizado))
  )
}

// ---------- Filtros combinaveis da fila (E2) ----------

// Estado inicial dos filtros: null significa "Todos" (grupo sem filtro)
export const FILTROS_VAZIOS = { status: null, prioridade: null, regiao: null }

// Monta as opcoes de um grupo de filtro a partir dos PROPRIOS registros (sem categorias inventadas).
//  campoValor: campo comparado no filtro (ex.: "status")
//  campoRotulo: campo exibido no botao (ex.: "statusLabel")
//  ordem: ordem de exibicao preferida; valores que nao existirem nos dados sao descartados
//         e valores dos dados que nao estiverem na lista entram no final.
//  rotulos (opcional): dicionario { valor: rotulo } usado quando a base guarda os rotulos uma
//         unica vez (ex.: painel-demonstrativo.json). Sem ele, o rotulo vem do campo campoRotulo.
export function opcoesDoCampo(chamados, campoValor, campoRotulo, ordem = [], rotulos = null) {
  const opcoes = []
  chamados.forEach((chamado) => {
    const jaExiste = opcoes.some((opcao) => opcao.valor === chamado[campoValor])
    if (!jaExiste) {
      const rotulo = rotulos ? rotulos[chamado[campoValor]] : chamado[campoRotulo]
      opcoes.push({ valor: chamado[campoValor], rotulo })
    }
  })

  const ordenadas = []
  ordem.forEach((valor) => {
    const opcao = opcoes.find((item) => item.valor === valor)
    if (opcao) ordenadas.push(opcao)
  })
  opcoes.forEach((opcao) => {
    if (!ordenadas.includes(opcao)) ordenadas.push(opcao)
  })
  return ordenadas
}

// Devolve os chamados que atendem a TODOS os filtros ativos (logica E).
// Um grupo com valor null nao restringe nada.
export function filtrarFila(chamados, filtros) {
  return chamados.filter(
    (chamado) =>
      (filtros.status === null || chamado.status === filtros.status) &&
      (filtros.prioridade === null || chamado.prioridade === filtros.prioridade) &&
      (filtros.regiao === null || chamado.regiao === filtros.regiao)
  )
}

// Ordem de exibicao das opcoes de cada grupo. Serve so para organizar: opcoes que nao existirem
// nos registros sao descartadas por opcoesDoCampo (ex.: "concluido" nao aparece na fila de Chamados).
export const ORDEM_FILTROS = {
  status: ['aberto', 'supervisor', 'atendimento', 'concluido'],
  prioridade: ['critica', 'alta', 'media', 'normal'],
  regiao: ['centro', 'sul', 'norte', 'leste', 'oeste'],
}

// Monta os tres grupos de filtro (Status, Prioridade, Regiao) a partir de uma lista de registros.
// Compartilhado entre telas: cada tela passa a sua propria base e recebe opcoes e rotulos dela.
//  rotulos (opcional): { status: {...}, prioridade: {...}, regiao: {...} } quando a base guarda
//  os rotulos em um dicionario. Sem ele (fila de Chamados), o comportamento e o mesmo de antes.
export function montarGruposFiltro(registros, rotulos = null) {
  const dicionario = (grupo) => (rotulos ? rotulos[grupo] : null)
  return [
    { campo: 'status', titulo: 'Status', opcoes: opcoesDoCampo(registros, 'status', 'statusLabel', ORDEM_FILTROS.status, dicionario('status')) },
    { campo: 'prioridade', titulo: 'Prioridade', opcoes: opcoesDoCampo(registros, 'prioridade', 'prioridadeLabel', ORDEM_FILTROS.prioridade, dicionario('prioridade')) },
    { campo: 'regiao', titulo: 'Região', opcoes: opcoesDoCampo(registros, 'regiao', 'regiaoLabel', ORDEM_FILTROS.regiao, dicionario('regiao')) },
  ]
}

// ---------- Selecao multipla (somente Painel Operacional, EP-R) ----------

// Cada grupo guarda uma LISTA de valores marcados. Lista vazia = "Todos".
export const SELECAO_VAZIA = { status: [], prioridade: [], regiao: [] }

// Logica: OU dentro do grupo (valor pertence a lista) e E entre os grupos.
export function filtrarPorSelecao(registros, selecao) {
  const atende = (lista, valor) => lista.length === 0 || lista.includes(valor)
  return registros.filter(
    (registro) =>
      atende(selecao.status, registro.status) &&
      atende(selecao.prioridade, registro.prioridade) &&
      atende(selecao.regiao, registro.regiao)
  )
}

// Quantidade de OPCOES marcadas (ex.: Critica + Alta + Zona Sul = 3)
export function contarSelecoes(selecao) {
  return selecao.status.length + selecao.prioridade.length + selecao.regiao.length
}

// Marca ou desmarca um valor de um grupo; valor null ("Todos") esvazia o grupo.
// Devolve uma NOVA selecao (nao altera a anterior).
export function alternarSelecao(selecao, campo, valor) {
  let lista
  if (valor === null) {
    lista = []
  } else if (selecao[campo].includes(valor)) {
    lista = selecao[campo].filter((item) => item !== valor)
  } else {
    lista = [...selecao[campo], valor]
  }
  return { ...selecao, [campo]: lista }
}

// Quantidade de grupos com filtro ativo (usado no botao de filtros e no botao "Limpar filtros")
export function contarFiltrosAtivos(filtros) {
  let total = 0
  if (filtros.status !== null) total = total + 1
  if (filtros.prioridade !== null) total = total + 1
  if (filtros.regiao !== null) total = total + 1
  return total
}

/* Reservada (ordenacao fora do Ciclo 2, decisao D13) */
export function ordenar() {}
