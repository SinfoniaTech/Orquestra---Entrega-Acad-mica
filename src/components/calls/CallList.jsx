// Componente: lista de chamados com estado vazio

import CallItem from "./CallItem.jsx"

export default function CallList({ chamados, mensagemVazia = "Nenhum chamado encontrado.", onLimpar }) {
  if (!chamados || chamados.length === 0) {
    return (
      <div className="empty-state">
        <p>{mensagemVazia}</p>
        {onLimpar && (
          <button type="button" className="empty-state__action" onClick={onLimpar}>
            Limpar filtro
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="call-list">
      {chamados.map((chamado) => (
        <CallItem key={chamado.id} chamado={chamado} />
      ))}
    </div>
  )
}
