// Filtros de chamados: critica, busca e grupos de filtros
export function filtrarPorCriticidade(chamados, nivel) {
  if (!nivel) return chamados
  return chamados.filter((chamado) => chamado.prioridade === nivel)
}

export function normalizarTexto(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

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

export function buscar(chamados, termo) {
  const termoNormalizado = normalizarTexto(termo).replace(/^#/, '')
  if (termoNormalizado === '') return chamados

  return chamados.filter((chamado) =>
    CAMPOS_BUSCA.some((campo) => normalizarTexto(chamado[campo]).includes(termoNormalizado))
  )
}

export const FILTROS_VAZIOS = { status: null, prioridade: null, regiao: null }

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

export function filtrarFila(chamados, filtros) {
  return chamados.filter(
    (chamado) =>
      (filtros.status === null || chamado.status === filtros.status) &&
      (filtros.prioridade === null || chamado.prioridade === filtros.prioridade) &&
      (filtros.regiao === null || chamado.regiao === filtros.regiao)
  )
}

export const ORDEM_FILTROS = {
  status: ['aberto', 'supervisor', 'atendimento', 'concluido'],
  prioridade: ['critica', 'alta', 'media', 'normal'],
  regiao: ['centro', 'sul', 'norte', 'leste', 'oeste'],
}

export function montarGruposFiltro(registros, rotulos = null) {
  const dicionario = (grupo) => (rotulos ? rotulos[grupo] : null)
  return [
    { campo: 'status', titulo: 'Status', opcoes: opcoesDoCampo(registros, 'status', 'statusLabel', ORDEM_FILTROS.status, dicionario('status')) },
    { campo: 'prioridade', titulo: 'Prioridade', opcoes: opcoesDoCampo(registros, 'prioridade', 'prioridadeLabel', ORDEM_FILTROS.prioridade, dicionario('prioridade')) },
    { campo: 'regiao', titulo: 'Região', opcoes: opcoesDoCampo(registros, 'regiao', 'regiaoLabel', ORDEM_FILTROS.regiao, dicionario('regiao')) },
  ]
}

export const SELECAO_VAZIA = { status: [], prioridade: [], regiao: [] }

export function filtrarPorSelecao(registros, selecao) {
  const atende = (lista, valor) => lista.length === 0 || lista.includes(valor)
  return registros.filter(
    (registro) =>
      atende(selecao.status, registro.status) &&
      atende(selecao.prioridade, registro.prioridade) &&
      atende(selecao.regiao, registro.regiao)
  )
}

export function contarSelecoes(selecao) {
  return selecao.status.length + selecao.prioridade.length + selecao.regiao.length
}

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

export function contarFiltrosAtivos(filtros) {
  let total = 0
  if (filtros.status !== null) total = total + 1
  if (filtros.prioridade !== null) total = total + 1
  if (filtros.regiao !== null) total = total + 1
  return total
}

export function ordenar() {}
