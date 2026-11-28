// Componente: item de chamado na lista

import { Link } from "react-router-dom"

export default function CallItem({ chamado }) {
  const prioridadeClass = "call-item__prioridade call-item__prioridade--" + chamado.prioridade
  const partesSla = chamado.slaTextoIndex.split(" · ")
  return (
    <Link to={"/chamados/" + chamado.id} className="call-item">
      <div className="call-item__header">
        <span className={prioridadeClass}>{chamado.prioridadeLabel}</span>
        <span className="call-item__id">#{chamado.id}</span>
      </div>
      <div className="call-item__body">
        <p className="call-item__local">{chamado.local} · {chamado.equipamento}</p>
        <p className="call-item__ocorrencia">{chamado.ocorrencia}</p>
      </div>
      <div className="call-item__sla">
        <span className="call-item__sla-texto">{partesSla[0]}</span>
        <span className="call-item__sla-tempo">{partesSla[1]}</span>
      </div>
    </Link>
  )
}
