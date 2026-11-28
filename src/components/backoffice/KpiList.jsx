// Componente: lista de indicadores KPI
export default function KpiList({ indicadores, chaves, legenda }) {
  return (
    <section className="kpis-block" aria-label="Indicadores">
      <div className="kpis">
        {chaves.map((chave) => {
          const kpi = indicadores.itens[chave]
          return (
            <article key={chave} className="kpi">
              <div className="kpi-label">{kpi.label}</div>
              <div className={'kpi-value is-' + kpi.tone}>{kpi.value}</div>
              <div className={'kpi-note is-' + kpi.tone}>{kpi.note}</div>
            </article>
          )
        })}
      </div>
      {legenda ? (
        <p className="data-source">{legenda}</p>
      ) : (
        indicadores.tipo === 'demonstrativo' && (
          <p className="data-source">
            Indicadores demonstrativos · universo: {indicadores.universo.toLowerCase()}.
          </p>
        )
      )}
    </section>
  )
}
