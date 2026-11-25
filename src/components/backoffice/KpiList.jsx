// Indicadores do topo das telas do Backoffice.
// Fonte unica: insights.json -> "indicadores". Cada tela informa apenas quais chaves exibe,
// assim o mesmo indicador nunca tem valores diferentes em telas diferentes.
// Os valores sao demonstrativos e exibidos exatamente como estao no arquivo.
export default function KpiList({ indicadores, chaves }) {
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
      {indicadores.tipo === 'demonstrativo' && (
        <p className="data-source">
          Indicadores demonstrativos · universo: {indicadores.universo.toLowerCase()} ·
          mesma base nas telas Chamados e Painel Operacional.
        </p>
      )}
    </section>
  )
}
