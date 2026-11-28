// Tela: linha do tempo do chamado

import { useParams } from 'react-router-dom'
import chamados from '../../data/chamados-mobile.json'

function LinhaDoTempo() {
  const { id } = useParams()
  const chamado = chamados.find((item) => item.id === id)

  if (!chamado) return null

  return (
    <section className="timeline-card">
      <h2>Linha do Tempo</h2>
      {chamado.timeline.length === 0 ? (
        <p className="history-empty-copy">Nenhum evento registrado.</p>
      ) : (
        <ol className="timeline-list">
          {chamado.timeline.map((evento) => (
            <li key={evento.hora + evento.descricao}>
              <time>{evento.hora}</time>
              <p>{evento.descricao}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default LinhaDoTempo
