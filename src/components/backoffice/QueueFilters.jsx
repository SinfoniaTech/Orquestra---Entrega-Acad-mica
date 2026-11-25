// Painel de filtros da fila de chamados (marcacao e classes do prototipo original: .filters, .chip).
// O estado fica na tela (BackofficeChamados); este componente apenas exibe e avisa as escolhas por props.
//
// grupos: [{ campo: "status", titulo: "Status", opcoes: [{ valor, rotulo }] }]
// filtros: { status, prioridade, regiao } (null = Todos)
// onAlterar(campo, valor): seleciona uma opcao (valor null = Todos)
// onLimpar(): volta todos os grupos para "Todos" (nao mexe na busca)
export default function QueueFilters({ id, grupos, filtros, onAlterar, onLimpar, filtrosAtivos }) {
  return (
    <div className="filters" id={id}>
      {grupos.map((grupo) => (
        <div key={grupo.campo} className="filter-group" role="group" aria-label={'Filtrar por ' + grupo.titulo}>
          <span className="filters-label">{grupo.titulo}:</span>
          <button
            type="button"
            className="chip"
            aria-pressed={filtros[grupo.campo] === null}
            onClick={() => onAlterar(grupo.campo, null)}
          >
            Todos
          </button>
          {grupo.opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              className="chip"
              aria-pressed={filtros[grupo.campo] === opcao.valor}
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
