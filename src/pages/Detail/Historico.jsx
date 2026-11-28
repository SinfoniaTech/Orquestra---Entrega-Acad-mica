// Tela: historico de ocorrencias do chamado

import { useParams } from 'react-router-dom'
import chamados from '../../data/chamados-mobile.json'

function Historico() {
  const { id } = useParams()
  const chamado = chamados.find((item) => item.id === id)

  if (!chamado) return null

  return (
    <section className="history-card">
      <h2>Recorrência</h2>
      <p>{chamado.recorrenciaTexto}</p>
      {chamado.historico.length === 0 ? (
        <p className="history-empty-copy">Sem ocorrências semelhantes nos últimos 30 dias.</p>
      ) : (
        <ul className="history-events">
          {chamado.historico.map((ocorrencia) => (
            <li key={ocorrencia.data + ocorrencia.descricao}>
              <time>{ocorrencia.data}</time>
              <p>{ocorrencia.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Historico
