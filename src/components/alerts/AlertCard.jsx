import { Link } from "react-router-dom"
import { NIVEIS } from "../../utils/criticidade.js"

export default function AlertCard({ chamado }) {
  const nivel = NIVEIS[chamado.prioridade]
  return (
    <article className={"alert-card " + nivel.classe}>
      <header>
        <span>{chamado.prioridadeLabel} · {nivel.cor}</span>
        <strong>#{chamado.id}</strong>
      </header>
      <h2>{chamado.local} · {chamado.equipamento}</h2>
      <p>{chamado.ocorrencia}</p>
      <p>{chamado.slaTextoAlertas}</p>
      <Link to={"/chamados/" + chamado.id} className="alert-card__link">Ver chamado</Link>
    </article>
  )
}
