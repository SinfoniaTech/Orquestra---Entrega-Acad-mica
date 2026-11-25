import { useState } from 'react'
import chamados from '../data/chamados-backoffice.json'
import insights from '../data/insights.json'
import { buscar, filtrarFila, montarGruposFiltro, contarFiltrosAtivos, FILTROS_VAZIOS } from '../utils/filters.js'
import BackofficeTopbar from '../components/backoffice/BackofficeTopbar.jsx'
import KpiList from '../components/backoffice/KpiList.jsx'
import BarChart from '../components/backoffice/BarChart.jsx'
import QueueFilters from '../components/backoffice/QueueFilters.jsx'

// Grupos de filtro (Status, Prioridade, Regiao) extraidos dos proprios registros da fila.
// montarGruposFiltro e compartilhada com o Painel Operacional (cada tela passa a sua base).
const GRUPOS_FILTRO = montarGruposFiltro(chamados)

// Quantidade de chamados exibidos antes de clicar em "Ver mais"
const LIMITE_INICIAL = 5

function BackofficeChamados() {
  const dados = insights.chamados

  // Texto digitado na busca (o campo fica na topbar e recebe o estado por props)
  const [busca, setBusca] = useState('')
  // Filtros selecionados (null = Todos) e visibilidade do painel de filtros
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  // false = mostra apenas os primeiros chamados; true = mostra a fila inteira
  const [verTodos, setVerTodos] = useState(false)

  // Busca e filtros sao aplicados em sequencia sobre os registros (logica E);
  // a lista original nao e alterada
  const resultado = filtrarFila(buscar(chamados, busca), filtros)
  const temBusca = busca.trim() !== ''
  const filtrosAtivos = contarFiltrosAtivos(filtros)
  const temCriterio = temBusca || filtrosAtivos > 0

  // Recorte exibido na tabela: 5 primeiros ou todos, conforme o botao
  const temMais = resultado.length > LIMITE_INICIAL
  const exibidos = verTodos ? resultado : resultado.slice(0, LIMITE_INICIAL)

  // Seleciona uma opcao em um grupo; os demais grupos sao mantidos (combinacao).
  // A forma setFiltros(anterior => ...) parte sempre do valor mais recente do estado,
  // evitando perder uma selecao quando duas alteracoes acontecem em sequencia.
  function alterarFiltro(campo, valor) {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }))
  }

  // Limpa apenas os filtros; o texto da busca e preservado
  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS)
  }

  // Grafico por regiao calculado a partir dos chamados reais da fila (chamados-backoffice.json).
  // A ordem das regioes segue insights.json (regioes).
  const gruposRegiao = dados.regioes.map((item) => {
    const quantidade = chamados.filter((chamado) => chamado.regiaoLabel === item.regiao).length
    return { rotulo: item.regiao, barras: [{ valor: quantidade, nome: 'Chamados ativos' }] }
  })

  return (
    <>
      <BackofficeTopbar
        titulo="Chamados"
        subtitulo="Acompanhamento de chamados de manutenção em tempo real"
        periodo="Tempo real"
        busca={busca}
        onBuscar={setBusca}
      />
      <main className="app-content">
        <KpiList indicadores={insights.indicadores} chaves={dados.kpis} />

        <section className="card" aria-labelledby="t-fluxo">
          <h2 id="t-fluxo">Fluxo de chamados</h2>
          <p className="card-sub">Ciclo do chamado no backoffice — execução consolidada dos sistemas OTIS</p>
          <div className="flow">
            {dados.fluxo.map((etapa, indice) => (
              <div key={etapa.label} className="flow-item">
                {indice > 0 && <i className="fa-solid fa-chevron-right flow-arrow" aria-hidden="true"></i>}
                <div className="flow-step">
                  <span className="flow-label">{etapa.label}</span>
                  {/* Etapas com "indicador" reaproveitam o valor da fonte unica (sem duplicar o numero no JSON) */}
                  <strong className="flow-value">
                    {etapa.indicador
                      ? insights.indicadores.itens[etapa.indicador].value
                      : etapa.value.toLocaleString('pt-BR')}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" aria-labelledby="t-fila">
          <div className="card-head">
            <div>
              <h2 id="t-fila">Fila de chamados</h2>
              <p className="card-sub">Ordenada por chegada (mais recente no topo)</p>
            </div>
            {/* Abre e fecha o painel de filtros; o numero indica quantos grupos estao filtrando */}
            <button
              type="button"
              className="btn-filter"
              aria-label={(filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros') + (filtrosAtivos > 0 ? ' (' + filtrosAtivos + ' ativo(s))' : '')}
              aria-expanded={filtrosAbertos}
              aria-controls="filtros-fila"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              <i className="fa-solid fa-filter" aria-hidden="true"></i>
              {filtrosAtivos > 0 && <span className="filter-count" aria-hidden="true">{filtrosAtivos}</span>}
            </button>
          </div>
          {filtrosAbertos && (
            <QueueFilters
              id="filtros-fila"
              grupos={GRUPOS_FILTRO}
              filtros={filtros}
              onAlterar={alterarFiltro}
              onLimpar={limparFiltros}
              filtrosAtivos={filtrosAtivos}
            />
          )}
          {resultado.length === 0 ? (
            <div className="empty-search" role="status">
              <p>
                Nenhum chamado encontrado
                {temBusca && <> para <strong>“{busca.trim()}”</strong></>}
                {filtrosAtivos > 0 && ' com os filtros selecionados'}.
              </p>
              <p className="empty-search__hint">
                A busca considera ID, local, equipamento, ocorrência, responsável, status, prioridade e região.
              </p>
              <div className="empty-search__actions">
                {temBusca && (
                  <button type="button" className="btn-clear" onClick={() => setBusca('')}>
                    Limpar busca
                  </button>
                )}
                {filtrosAtivos > 0 && (
                  <button type="button" className="btn-clear" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Local · Equipamento</th>
                    <th>Ocorrência</th>
                    <th>Prioridade</th>
                    <th>Região</th>
                    <th>Status</th>
                    <th>SLA restante</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {exibidos.map((chamado) => (
                    <tr key={chamado.id}>
                      <td>#{chamado.id}</td>
                      <td>{chamado.local} · {chamado.equipamento}</td>
                      <td>{chamado.ocorrencia}</td>
                      <td>
                        <span className={'prio prio-' + chamado.prioridade}>
                          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                          {chamado.prioridadeLabel.toUpperCase()}
                        </span>
                      </td>
                      <td>{chamado.regiaoLabel}</td>
                      <td><span className={'status status-' + chamado.status}>{chamado.statusLabel}</span></td>
                      <td className="col-sla">
                        <div className="meter"><span style={{ width: chamado.slaPercent + '%' }}></span></div>
                        <p className="sla-text">{chamado.slaTexto}</p>
                      </td>
                      <td>{chamado.responsavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="queue-foot">
            {/* O botao so aparece quando ha mais chamados do que o limite inicial */}
            {temMais && (
              <button
                type="button"
                className="btn-clear"
                aria-expanded={verTodos}
                onClick={() => setVerTodos(!verTodos)}
              >
                {verTodos ? 'Ver menos' : 'Ver mais (' + (resultado.length - LIMITE_INICIAL) + ')'}
              </button>
            )}
            <p className="queue-count" aria-live="polite">
              {temCriterio
                ? 'Mostrando ' + exibidos.length + ' de ' + resultado.length + ' resultados · fila com ' + chamados.length + ' chamados'
                : 'Mostrando ' + exibidos.length + ' de ' + chamados.length + ' chamados'}
            </p>
          </div>
        </section>

        <section className="insights" aria-label="Eventos e distribuição">
          {/* A altura do card de eventos acompanha o grafico ao lado; se a lista for maior, ela rola */}
          <article className="card events-card">
            <div className="events-card__inner">
              <h2>Eventos da integração</h2>
              <p className="card-sub">Últimos eventos recebidos — mais recente no topo</p>
              <ul className="events">
                {dados.eventosIntegracao.map((evento) => (
                  <li key={evento.hora + evento.descricao}>
                    <time>{evento.hora}</time>
                    <div>
                      <p>{evento.descricao}</p>
                      <span className="event-source">{evento.fonte}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>
          <article className="card">
            <h2>Chamados por região</h2>
            <p className="card-sub">Distribuição da fila ativa</p>
            <ul className="legend"><li>Chamados ativos</li></ul>
            <BarChart titulo="Chamados ativos por região" grupos={gruposRegiao} simples eixoX="Região" />
          </article>
        </section>
      </main>
    </>
  )
}

export default BackofficeChamados