import CallItem from "./CallItem.jsx"

// Recebe a lista de chamados por props (a Home envia a lista ja filtrada).
// mensagemVazia e onLimpar sao opcionais e personalizam o estado vazio.
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
