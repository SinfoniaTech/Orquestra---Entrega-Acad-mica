// Regras de SLA: limites e classificacao de prazo, risco e estourado
export const LIMITE_RISCO = 70
export const LIMITE_ESTOURO = 100

export const CLASSES_SLA = ['prazo', 'risco', 'estourado', 'indeterminado']
export const ROTULOS_SLA = {
  prazo: 'No prazo',
  risco: 'Em risco',
  estourado: 'Estourado',
  indeterminado: 'Indeterminado',
}

function ehNumero(valor) {
  return typeof valor === 'number' && !Number.isNaN(valor)
}

export function classificarSla(percentual) {
  if (!ehNumero(percentual)) return 'indeterminado'
  if (percentual >= LIMITE_ESTOURO) return 'estourado'
  if (percentual > LIMITE_RISCO) return 'risco'
  return 'prazo'
}

export function tempoUtilizadoMin(registro) {
  const tempo = registro.status === 'concluido' ? registro.tempoSolucaoMin : registro.tempoDecorridoMin
  return ehNumero(tempo) ? tempo : null
}

export function calcularConsumoSla(registro, prazosMin) {
  const tempo = tempoUtilizadoMin(registro)
  const prazo = prazosMin[registro.prioridade]
  if (tempo === null || !ehNumero(prazo) || prazo <= 0) return null
  return (tempo / prazo) * 100
}

export function classificarRegistro(registro, prazosMin) {
  return classificarSla(calcularConsumoSla(registro, prazosMin))
}
