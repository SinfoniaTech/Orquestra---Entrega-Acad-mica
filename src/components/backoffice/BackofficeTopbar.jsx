// Barra superior das telas do Backoffice. Titulo, subtitulo e periodo variam por tela (props).
// Busca: campo controlado (o texto fica no estado da tela que usa a topbar, via props busca/onBuscar).
// Na tela sem fila (Painel), a busca e exibida desabilitada (buscaDesabilitada).
// O seletor de periodo continua apenas visual (fora do Ciclo 2, decisao D13).
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
          {periodo} <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
    </header>
  )
}
