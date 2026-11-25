/* src/utils/sla.js */
/* Regras de SLA centralizadas (consumo e classificacao). Funcoes puras: nao alteram os registros. */

// Limites da classificacao (decisao D6 do Ciclo 2)
export const LIMITE_RISCO = 70
export const LIMITE_ESTOURO = 100

// Ordem e rotulos das classes de SLA (usados em contagens e, futuramente, na interface)
export const CLASSES_SLA = ['prazo', 'risco', 'estourado', 'indeterminado']
export const ROTULOS_SLA = {
  prazo: 'No prazo',
  risco: 'Em risco',
  estourado: 'Estourado',
  indeterminado: 'Indeterminado',
}

// Verifica se um valor e um numero utilizavel (null, undefined e NaN nao contam)
function ehNumero(valor) {
  return typeof valor === 'number' && !Number.isNaN(valor)
}

// Classifica um percentual de SLA ja calculado:
//  >= 100 -> estourado | > 70 e < 100 -> risco | <= 70 -> prazo | sem valor -> indeterminado
export function classificarSla(percentual) {
  if (!ehNumero(percentual)) return 'indeterminado'
  if (percentual >= LIMITE_ESTOURO) return 'estourado'
  if (percentual > LIMITE_RISCO) return 'risco'
  return 'prazo'
}

// Tempo utilizado no SLA (base demonstrativa do Painel):
//  concluido -> tempoSolucaoMin | aberto, supervisor, atendimento -> tempoDecorridoMin
// Devolve null quando o tempo necessario nao esta informado (nunca troca null por zero).
export function tempoUtilizadoMin(registro) {
  const tempo = registro.status === 'concluido' ? registro.tempoSolucaoMin : registro.tempoDecorridoMin
  return ehNumero(tempo) ? tempo : null
}

// Consumo do SLA em porcentagem: SLA (%) = (tempo utilizado / prazo de SLA) x 100
// O prazo vem da prioridade do registro (prazosMin: { critica: 60, alta: 150, ... }).
// Devolve null se faltar o tempo utilizado ou o prazo.
export function calcularConsumoSla(registro, prazosMin) {
  const tempo = tempoUtilizadoMin(registro)
  const prazo = prazosMin[registro.prioridade]
  if (tempo === null || !ehNumero(prazo) || prazo <= 0) return null
  return (tempo / prazo) * 100
}

// Classe de SLA de um registro da base demonstrativa
export function classificarRegistro(registro, prazosMin) {
  return classificarSla(calcularConsumoSla(registro, prazosMin))
}
