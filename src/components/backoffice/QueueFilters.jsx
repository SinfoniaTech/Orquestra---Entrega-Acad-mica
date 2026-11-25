// Painel de filtros da fila de chamados (marcacao e classes do prototipo original: .filters, .chip).
// O estado fica na tela (BackofficeChamados); este componente apenas exibe e avisa as escolhas por props.
//
// grupos: [{ campo: "status", titulo: "Status", opcoes: [{ valor, rotulo }] }]
// filtros: { status, prioridade, regiao } (null = Todos)
// onAlterar(campo, valor): seleciona uma opcao (valor null = Todos)
// onLimpar(): volta todos os grupos para "Todos" (nao mexe na busca)
// multipla (opcional, padrao false): quando true, cada grupo guarda uma LISTA de valores
//   (filtros: { status: [], ... }) e cada chip marca/desmarca o seu valor. Usado apenas no Painel.
//   Sem essa propriedade, o comportamento e exatamente o da fila de Chamados.
export default function QueueFilters({ id, grupos, filtros, onAlterar, onLimpar, filtrosAtivos, multipla = false }) {
  // "Todos" fica marcado quando o grupo nao tem filtro
  function todosMarcado(campo) {
    return multipla ? filtros[campo].length === 0 : filtros[campo] === null
  }
  // A opcao fica marcada quando faz parte da selecao do grupo
  function opcaoMarcada(campo, valor) {
    return multipla ? filtros[campo].includes(valor) : filtros[campo] === valor
  }

  return (
    <div className="filters" id={id}>
      {grupos.map((grupo) => (
        <div key={grupo.campo} className="filter-group" role="group" aria-label={'Filtrar por ' + grupo.titulo}>
          <span className="filters-label">{grupo.titulo}:</span>
          <button
            type="button"
            className="chip"
            aria-pressed={todosMarcado(grupo.campo)}
            onClick={() => onAlterar(grupo.campo, null)}
          >
            Todos
          </button>
          {grupo.opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              className="chip"
              aria-pressed={opcaoMarcada(grupo.campo, opcao.valor)}
              onClick={() => onAlterar(grupo.campo, opcao.valor)}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
      ))}
      <div className="filters-actions">
        <button type="button" className="btn-clear" onClick={onLimpar} disabled={filtrosAtivos === 0}>
          Limpar filtros
        </button>
      </div>
    </div>
  )
}
