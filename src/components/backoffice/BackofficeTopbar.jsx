
export default function BackofficeTopbar({ titulo, subtitulo, periodo, busca = '', onBuscar, buscaDesabilitada = false }) {
  const textoBusca = buscaDesabilitada
    ? 'Busca disponível na fila de Chamados'
    : 'Buscar por ID, local, equipamento, ocorrência…'

  return (
    <header className="topbar">
      <div>
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>
      <div className="topbar-tools">
        <label className={'search' + (buscaDesabilitada ? ' is-disabled' : '')} title={buscaDesabilitada ? textoBusca : undefined}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            type="search"
            placeholder={textoBusca}
            aria-label={
              buscaDesabilitada
                ? textoBusca
                : 'Buscar chamados por ID, local, equipamento, ocorrência, responsável, status, prioridade ou região'
            }
            value={busca}
            onChange={(evento) => {
              if (onBuscar) onBuscar(evento.target.value)
            }}
            disabled={buscaDesabilitada}
          />
        </label>
        <button type="button" className="btn-period">
          {periodo}
        </button>
      </div>
    </header>
  )
}
