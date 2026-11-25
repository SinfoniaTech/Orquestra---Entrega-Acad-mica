import { NIVEIS } from "../utils/criticidade.js"

const ordem = ["critica", "alta", "media", "normal"]

// Botoes de filtro por criticidade. O estado fica na Home; este componente
// apenas recebe o filtro ativo e a funcao de selecao por props.
export default function CriticalityFilter({ filtroAtivo, onSelecionar }) {
  return (
    // d-flex + flex-wrap (Bootstrap 5): os botoes quebram para a linha de baixo em vez de serem cortados
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
