/* src/utils/stats.js */
/* Calculo de indicadores a partir de uma lista de registros (normalmente o resultado dos filtros).
   Funcoes puras: recebem os registros e devolvem numeros, sem alterar nada.
   Regra geral: campos null/ausentes NAO entram em medias e percentuais (nunca sao tratados como zero).
   Medias e percentuais devolvem tambem a "base" (quantidade de registros usados no calculo). */

import { classificarRegistro, CLASSES_SLA } from './sla.js'

// Verifica se um valor e um numero utilizavel
function ehNumero(valor) {
  return typeof valor === 'number' && !Number.isNaN(valor)
}

// Percentual simples: parte / total x 100. Sem total (0) nao ha percentual: devolve null.
export function percentual(parte, total) {
  if (total === 0) return null
  return (parte / total) * 100
}

// Total de registros
export function contarRegistros(registros) {
  return registros.length
}

// Quantidade por opcao de um campo, mantendo TODAS as opcoes informadas (inclusive as com zero).
//  opcoes: [{ valor, rotulo }] (ex.: vindas de opcoesDoCampo)
//  devolve: [{ valor, rotulo, quantidade }]
export function contarPorOpcoes(registros, campo, opcoes) {
  return opcoes.map((opcao) => ({
    valor: opcao.valor,
    rotulo: opcao.rotulo,
    quantidade: registros.filter((registro) => registro[campo] === opcao.valor).length,
  }))
}

// Quantidade de registros reincidentes
export function contarReincidencias(registros) {
  return registros.filter((registro) => registro.reincidencia === true).length
}

// Media de um campo numerico, considerando somente os registros com o valor informado.
//  devolve: { media, base } (media = null quando nenhum registro tem o valor)
export function mediaDoCampo(registros, campo) {
  let soma = 0
  let base = 0
  registros.forEach((registro) => {
    if (ehNumero(registro[campo])) {
      soma = soma + registro[campo]
      base = base + 1
    }
  })
  return { media: base === 0 ? null : soma / base, base }
}

// TA medio: media de tempoChegadaMin dos registros que tem esse tempo
export function calcularTaMedio(registros) {
  return mediaDoCampo(registros, 'tempoChegadaMin')
}

// TB medio: media de tempoSolucaoMin somente dos chamados CONCLUIDOS com o tempo informado
export function calcularTbMedio(registros) {
  const concluidos = registros.filter((registro) => registro.status === 'concluido')
  return mediaDoCampo(concluidos, 'tempoSolucaoMin')
}

// Concluidos x nao concluidos
export function contarConclusao(registros) {
  const concluidos = registros.filter((registro) => registro.status === 'concluido').length
  return { concluidos, naoConcluidos: registros.length - concluidos }
}

// Quantidade por classe de SLA (prazo, risco, estourado, indeterminado).
//  comClassificacao = registros com classe definida (base dos percentuais de SLA)
export function resumoSla(registros, prazosMin) {
  const resumo = { prazo: 0, risco: 0, estourado: 0, indeterminado: 0 }
  registros.forEach((registro) => {
    const classe = classificarRegistro(registro, prazosMin)
    resumo[classe] = resumo[classe] + 1
  })
  resumo.comClassificacao = registros.length - resumo.indeterminado
  return resumo
}

// Quantidade de chamados e de reincidencias por mes de abertura.
//  meses: [{ chave: "2025-07", rotulo: "Jul" }] (meses sem registros aparecem com zero)
//  O mes vem dos 7 primeiros caracteres de dataAbertura ("2025-07-03" -> "2025-07").
export function agruparPorMes(registros, meses) {
  return meses.map((mes) => {
    const doMes = registros.filter((registro) => registro.dataAbertura.slice(0, 7) === mes.chave)
    return {
      chave: mes.chave,
      rotulo: mes.rotulo,
      chamados: doMes.length,
      reincidencias: contarReincidencias(doMes),
    }
  })
}

// Quantidade de responsaveis diferentes, ignorando vazios e "—"
export function contarResponsaveis(registros) {
  const nomes = []
  registros.forEach((registro) => {
    const nome = typeof registro.responsavel === 'string' ? registro.responsavel.trim() : ''
    if (nome !== '' && nome !== '—' && !nomes.includes(nome)) nomes.push(nome)
  })
  return nomes.length
}

// Indicadores de uma regiao (ou de qualquer conjunto de registros), com denominadores explicitos:
//  taMedio / tbMedio: { media, base }
//  slaNoPrazo: quantidade "no prazo" / registros com classificacao de SLA
//  reincidencia: reincidentes / total de registros
export function indicadoresDoGrupo(registros, prazosMin) {
  const sla = resumoSla(registros, prazosMin)
  const reincidentes = contarReincidencias(registros)
  return {
    total: registros.length,
    taMedio: calcularTaMedio(registros),
    tbMedio: calcularTbMedio(registros),
    slaNoPrazo: { quantidade: sla.prazo, base: sla.comClassificacao, percentual: percentual(sla.prazo, sla.comClassificacao) },
    reincidencia: { quantidade: reincidentes, base: registros.length, percentual: percentual(reincidentes, registros.length) },
    responsaveis: contarResponsaveis(registros),
  }
}

// Performance por regiao: indicadores de cada regiao informada (inclusive regioes sem registros)
//  regioes: [{ valor, rotulo }]
export function performancePorRegiao(registros, regioes, prazosMin) {
  return regioes.map((regiao) => ({
    valor: regiao.valor,
    rotulo: regiao.rotulo,
    ...indicadoresDoGrupo(registros.filter((registro) => registro.regiao === regiao.valor), prazosMin),
  }))
}

// Reune os indicadores usados pelo Painel em um unico objeto.
//  opcoes: { status, prioridade, regiao, tipoOcorrencia } -> listas [{ valor, rotulo }]
//  configuracao: { prazosMin, meses }
export function calcularIndicadores(registros, opcoes, configuracao) {
  return {
    total: contarRegistros(registros),
    conclusao: contarConclusao(registros),
    porStatus: contarPorOpcoes(registros, 'status', opcoes.status),
    porPrioridade: contarPorOpcoes(registros, 'prioridade', opcoes.prioridade),
    porRegiao: contarPorOpcoes(registros, 'regiao', opcoes.regiao),
    porTipo: contarPorOpcoes(registros, 'tipoOcorrencia', opcoes.tipoOcorrencia),
    reincidencias: contarReincidencias(registros),
    taMedio: calcularTaMedio(registros),
    tbMedio: calcularTbMedio(registros),
    sla: resumoSla(registros, configuracao.prazosMin),
    porMes: agruparPorMes(registros, configuracao.meses),
    porRegiaoPerformance: performancePorRegiao(registros, opcoes.regiao, configuracao.prazosMin),
  }
}

// Ordem de exibicao das classes de SLA (reexportada para quem montar graficos de SLA)
export { CLASSES_SLA }
