// Componente: painel de filtros da fila de chamados
export default function QueueFilters({ id, grupos, filtros, onAlterar, onLimpar, filtrosAtivos, multipla = false }) {
  function todosMarcado(campo) {
    return multipla ? filtros[campo].length === 0 : filtros[campo] === null
  }
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
