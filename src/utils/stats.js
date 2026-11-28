// Calculo de indicadores: totais, medias, SLA e desempenho por regiao
import { classificarRegistro, CLASSES_SLA } from './sla.js'

function ehNumero(valor) {
  return typeof valor === 'number' && !Number.isNaN(valor)
}

export function percentual(parte, total) {
  if (total === 0) return null
  return (parte / total) * 100
}

export function contarRegistros(registros) {
  return registros.length
}

export function contarPorOpcoes(registros, campo, opcoes) {
  return opcoes.map((opcao) => ({
    valor: opcao.valor,
    rotulo: opcao.rotulo,
    quantidade: registros.filter((registro) => registro[campo] === opcao.valor).length,
  }))
}

export function contarReincidencias(registros) {
  return registros.filter((registro) => registro.reincidencia === true).length
}

export function contarPorOpcoesComReincidencia(registros, campo, opcoes) {
  return opcoes.map((opcao) => {
    const daOpcao = registros.filter((registro) => registro[campo] === opcao.valor)
    return { valor: opcao.valor, rotulo: opcao.rotulo, quantidade: daOpcao.length, reincidentes: contarReincidencias(daOpcao) }
  })
}

export function contarCriticasEmAtendimento(registros) {
  return registros.filter((registro) => registro.status === 'atendimento' && registro.prioridade === 'critica').length
}

export function variacaoUltimoMes(porMes) {
  let ultimo = -1
  porMes.forEach((mes, indice) => {
    if (mes.chamados > 0) ultimo = indice
  })
  if (ultimo < 1) return { percentual: null, atual: null, anterior: null }
  const atual = porMes[ultimo]
  const anterior = porMes[ultimo - 1]
  return { percentual: percentual(atual.chamados - anterior.chamados, anterior.chamados), atual: atual.rotulo, anterior: anterior.rotulo }
}

export function formatarDuracao(minutos) {
  if (!ehNumero(minutos)) return '—'
  const total = Math.round(minutos)
  if (total < 60) return total + ' min'
  const horas = Math.floor(total / 60)
  const resto = total % 60
  return resto === 0 ? horas + 'h' : horas + 'h ' + resto + 'min'
}

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

export function calcularTaMedio(registros) {
  return mediaDoCampo(registros, 'tempoChegadaMin')
}

export function calcularTbMedio(registros) {
  const concluidos = registros.filter((registro) => registro.status === 'concluido')
  return mediaDoCampo(concluidos, 'tempoSolucaoMin')
}

export function contarConclusao(registros) {
  const concluidos = registros.filter((registro) => registro.status === 'concluido').length
  return { concluidos, naoConcluidos: registros.length - concluidos }
}

export function resumoSla(registros, prazosMin) {
  const resumo = { prazo: 0, risco: 0, estourado: 0, indeterminado: 0 }
  registros.forEach((registro) => {
    const classe = classificarRegistro(registro, prazosMin)
    resumo[classe] = resumo[classe] + 1
  })
  resumo.comClassificacao = registros.length - resumo.indeterminado
  return resumo
}

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

export function contarResponsaveis(registros) {
  const nomes = []
  registros.forEach((registro) => {
    const nome = typeof registro.responsavel === 'string' ? registro.responsavel.trim() : ''
    if (nome !== '' && nome !== '—' && !nomes.includes(nome)) nomes.push(nome)
  })
  return nomes.length
}

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

export function performancePorRegiao(registros, regioes, prazosMin) {
  return regioes.map((regiao) => ({
    valor: regiao.valor,
    rotulo: regiao.rotulo,
    ...indicadoresDoGrupo(registros.filter((registro) => registro.regiao === regiao.valor), prazosMin),
  }))
}

export function calcularIndicadores(registros, opcoes, configuracao) {
  const porMes = agruparPorMes(registros, configuracao.meses)
  return {
    total: contarRegistros(registros),
    conclusao: contarConclusao(registros),
    porStatus: contarPorOpcoes(registros, 'status', opcoes.status),
    porPrioridade: contarPorOpcoes(registros, 'prioridade', opcoes.prioridade),
    porRegiao: contarPorOpcoes(registros, 'regiao', opcoes.regiao),
    porTipo: contarPorOpcoesComReincidencia(registros, 'tipoOcorrencia', opcoes.tipoOcorrencia),
    reincidencias: contarReincidencias(registros),
    criticasEmAtendimento: contarCriticasEmAtendimento(registros),
    taMedio: calcularTaMedio(registros),
    tbMedio: calcularTbMedio(registros),
    sla: resumoSla(registros, configuracao.prazosMin),
    porMes,
    variacaoMensal: variacaoUltimoMes(porMes),
    porRegiaoPerformance: performancePorRegiao(registros, opcoes.regiao, configuracao.prazosMin),
  }
}

export { CLASSES_SLA }
