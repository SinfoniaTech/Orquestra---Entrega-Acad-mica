// Componente: filtro de chamados por criticidade

import { NIVEIS } from "../utils/criticidade.js"

const ordem = ["critica", "alta", "media", "normal"]

export default function CriticalityFilter({ filtroAtivo, onSelecionar }) {
  return (
    <div className="criticality-navigation d-flex flex-wrap" role="group" aria-label="Filtrar chamados por criticidade">
      <button
        type="button"
        className="criticality-all"
        aria-pressed={filtroAtivo === null}
        onClick={() => onSelecionar(null)}
      >
        Todos
      </button>
      {ordem.map((nivel) => (
        <button
          key={nivel}
          type="button"
          className={NIVEIS[nivel].classe}
          aria-pressed={filtroAtivo === nivel}
          onClick={() => onSelecionar(nivel)}
        >
          {NIVEIS[nivel].menu} · {NIVEIS[nivel].cor}
        </button>
      ))}
    </div>
  )
}
