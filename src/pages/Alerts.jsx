import chamados from "../data/chamados-mobile.json"
import { filtrarPorCriticidade } from "../utils/filters.js"
import PageHeading from "../components/PageHeading.jsx"
import AlertCard from "../components/alerts/AlertCard.jsx"

function Alerts() {
  // A tela original de Alertas lista os chamados de criticidade critica (vermelhos)
  const criticos = filtrarPorCriticidade(chamados, "critica")

  return (
    <section className="page">
      <PageHeading titulo="Alertas" subtitulo={criticos.length + " chamados críticos"} />
      {criticos.length === 0 ? (
        <div className="empty-state"><p>Nenhum alerta no momento.</p></div>
      ) : (
        <section className="alerts-list" aria-label="Alertas vermelhos">
          {criticos.map((chamado) => (
            <AlertCard key={chamado.id} chamado={chamado} />
          ))}
        </section>
      )}
    </section>
  )
}

export default Alerts
