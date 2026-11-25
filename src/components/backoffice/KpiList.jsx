// Indicadores do topo das telas do Backoffice.
// indicadores: { tipo, universo, itens: { chave: { label, value, note, tone } } }
// chaves: quais itens exibir, na ordem.
//  - Tela Chamados: itens de insights.json -> "indicadores" (operacao consolidada, valores fixos do arquivo).
//  - Painel Operacional: itens calculados a partir da base demonstrativa filtrada.
// legenda (opcional): texto exibido abaixo dos cards. Sem ela, mantem a legenda padrao dos
// indicadores demonstrativos consolidados.
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
