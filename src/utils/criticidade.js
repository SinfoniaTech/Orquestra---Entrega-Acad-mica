/* src/utils/criticidade.js */
/* Dados fixos de apresentacao de cada nivel de criticidade (classe de cor, nome da cor e titulo).
   A chave corresponde ao campo "prioridade" dos JSONs e ao parametro :nivel da rota /criticidade/:nivel. */

export const NIVEIS = {
  critica: { classe: 'criticality-red', cor: 'Vermelho', titulo: 'Críticos', menu: 'Críticos' },
  alta: { classe: 'criticality-orange', cor: 'Laranja', titulo: 'Alta prioridade', menu: 'Alta' },
  media: { classe: 'criticality-yellow', cor: 'Amarelo', titulo: 'Média prioridade', menu: 'Média' },
  normal: { classe: 'criticality-green', cor: 'Verde', titulo: 'Padrão', menu: 'Normal' },
}
