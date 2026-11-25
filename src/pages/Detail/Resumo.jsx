import { useParams } from 'react-router-dom'
import chamados from '../../data/chamados-mobile.json'

function Resumo() {
  const { id } = useParams()
  const chamado = chamados.find((item) => item.id === id)

  // Detail.jsx ja exibe a mensagem de chamado inexistente
  if (!chamado) return null

  const tecnico = chamado.tecnico
  const peca = chamado.peca

  return (
    <>
      <section className="event-card">
        <h2>Evento</h2>
        <p className="event-problem">{chamado.ocorrencia}</p>
        <p>{chamado.local}</p>
        <p>{chamado.equipamento}</p>
        {chamado.endereco && <address>{chamado.endereco}</address>}
      </section>

      <section className="impact-card">
        <h2>Impacto Temporal</h2>
        <dl>
          <div><dt>Solução prevista (SLA)</dt><dd>{chamado.slaPrevisto}</dd></div>
          <div><dt>Tempo decorrido (TA)</dt><dd>{chamado.tempoDecorrido}</dd></div>
          <div>
            <dt>Tempo restante (TB)</dt>
            <dd className="detail-emphasis">{chamado.tempoRestante}</dd>
          </div>
        </dl>
        {/* Divergencia documentada no JSON: exibida como registro, sem ser resolvida aqui */}
        {chamado.slaCorrecao && (
          <p className="detail-note">
            Valor original no protótipo: {chamado.slaCorrecao.valorOriginal} (divergência de SLA documentada)
          </p>
        )}
      </section>

      <section className="suggestions-card">
        <h2>Ações sugeridas pelo ORQUESTRA</h2>
        <div className="detail-recommendations">
          <article>
            <h3>Status do técnico</h3>
            {tecnico ? (
              <>
                <p>{tecnico.nome} · {tecnico.status}</p>
                <p>{tecnico.distancia} · ETA {tecnico.eta}</p>
                <p>Chegada prevista em {tecnico.chegadaPrevista}</p>
              </>
            ) : (
              <p className="detail-muted">Informação não disponível.</p>
            )}
          </article>
          <article>
            <h3>Peça mais rápida</h3>
            {peca ? (
              <>
                <p>{peca.nome}</p>
                <p>{peca.local}</p>
                <p>{peca.eta ? 'ETA ' + peca.eta + ' · previsão ' + peca.previsao : peca.previsao}</p>
              </>
            ) : (
              <p className="detail-muted">Informação não disponível.</p>
            )}
          </article>
        </div>
        <ul className="detail-bullets">
          {chamado.acoesSugeridas.map((acao) => (
            <li key={acao}>{acao}</li>
          ))}
        </ul>
      </section>

      {/* No original os botoes de contato sao desabilitados */}
      <section className="contact-actions" aria-label="Contato com o técnico">
        <button type="button" disabled>Ligar técnico</button>
        <button type="button" disabled>WhatsApp</button>
      </section>
    </>
  )
}

export default Resumo
