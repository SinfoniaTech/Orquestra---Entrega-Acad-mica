import { useState } from 'react'
import insights from '../data/insights.json'
import graficos from '../data/graficos-demonstrativos.json'
import painelDemonstrativo from '../data/painel-demonstrativo.json'
import { filtrarFila, montarGruposFiltro, contarFiltrosAtivos, FILTROS_VAZIOS } from '../utils/filters.js'
import BackofficeTopbar from '../components/backoffice/BackofficeTopbar.jsx'
import KpiList from '../components/backoffice/KpiList.jsx'
import BarChart from '../components/backoffice/BarChart.jsx'
import QueueFilters from '../components/backoffice/QueueFilters.jsx'

// Tabelas fixas de apresentacao (texto do JSON -> classe CSS do original)
const classePadrao = { 'Recorrência confirmada': 'badge-red', 'Em observação': 'badge-yellow' }
const classeNivel = { 'Crítica': 'critica', 'Alta': 'alta', 'Média': 'media' }

// Base demonstrativa do Painel (36 registros ficticios, jul-set 2025), independente das demais bases
const BASE_DEMONSTRATIVA = painelDemonstrativo.chamados
// Mesmos grupos e regras da fila de Chamados, com as opcoes derivadas desta base
const GRUPOS_FILTRO_PAINEL = montarGruposFiltro(BASE_DEMONSTRATIVA)

// "2025-07-02" -> "02/07/2025"
function formatarData(dataIso) {
  return dataIso.split('-').reverse().join('/')
}

function BackofficePainel() {
  const painel = insights.painelOperacional

  // Estado proprio do Painel (independente da tela Chamados). O painel de filtros inicia aberto (DP7).
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)

  // Registros da base demonstrativa que atendem a todos os filtros (logica E)
  const registrosFiltrados = filtrarFila(BASE_DEMONSTRATIVA, filtros)
  const filtrosAtivos = contarFiltrosAtivos(filtros)

  // Mesma forma usada em Chamados: parte sempre do valor mais recente do estado
  function alterarFiltro(campo, valor) {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS)
  }

  // Conversao dos dados demonstrativos para o formato do BarChart (rotulo + barras)
  const gruposPeriodo = graficos.chamadasPorPeriodo.map((item) => ({
    rotulo: item.mes,
    barras: [
      { valor: item.chamadas, nome: 'Chamadas' },
      { valor: item.reincidencias, nome: 'Reincidências', classe: 'is-alt' },
    ],
  }))

  const gruposPrioridade = graficos.chamadasPorPrioridade.map((item) => ({
    rotulo: item.categoria,
    barras: [{ valor: item.valor, classe: 'p-' + item.chave }],
  }))

  const gruposTipo = graficos.chamadasPorTipoOcorrencia.map((item) => ({
    rotulo: item.categoria,
    barras: [{ valor: item.valor }],
  }))

  // Totais somados a partir dos mesmos dados exibidos nas barras
  function somar(lista, campo) {
    let total = 0
    lista.forEach((item) => {
      total = total + item[campo]
    })
    return total
  }

  function formatar(valor) {
    return valor.toLocaleString('pt-BR')
  }

  const totalPeriodo = somar(graficos.chamadasPorPeriodo, 'chamadas')
  const totalReincidencias = somar(graficos.chamadasPorPeriodo, 'reincidencias')
  const percentualReincidencias =
    ((totalReincidencias / totalPeriodo) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
  const totalPrioridade = somar(graficos.chamadasPorPrioridade, 'valor')
  const totalTipo = somar(graficos.chamadasPorTipoOcorrencia, 'valor')

  // Periodo dos meses exibidos (primeiro e ultimo mes do JSON), ex.: "Abr–Set"
  const meses = graficos.chamadasPorPeriodo
  const periodo = meses[0].mes + '–' + meses[meses.length - 1].mes

  return (
    <>
      <BackofficeTopbar
        titulo="Painel Operacional"
        subtitulo="Padrões, recorrências, TA/TB e oportunidades de melhoria contínua da operação"
        periodo="Últimos 6 meses"
        buscaDesabilitada
      />
      <main className="app-content">
        <KpiList indicadores={insights.indicadores} chaves={painel.kpis} />

        {/* Filtros da base demonstrativa (EP2). Nao alteram os 6 KPIs consolidados acima (insights.json). */}
        <section className="card" aria-labelledby="t-filtros-indicadores">
          <div className="card-head">
            <div>
              <div className="chart-head">
                <h2 id="t-filtros-indicadores">Filtros dos indicadores</h2>
                <span className="tag-demo" title={painelDemonstrativo.documentacao.aviso}>Base demonstrativa</span>
              </div>
              <p className="card-sub">
                Selecione status, prioridade e região para filtrar os {BASE_DEMONSTRATIVA.length} chamados
                da base demonstrativa (jul–set 2025). Os indicadores consolidados do topo não são afetados.
              </p>
            </div>
            {/* Abre e fecha o painel de filtros; o numero indica quantos grupos estao filtrando */}
            <button
              type="button"
              className="btn-filter"
              aria-label={(filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros') + (filtrosAtivos > 0 ? ' (' + filtrosAtivos + ' ativo(s))' : '')}
              aria-expanded={filtrosAbertos}
              aria-controls="filtros-painel"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              <i className="fa-solid fa-filter" aria-hidden="true"></i>
              {filtrosAtivos > 0 && <span className="filter-count" aria-hidden="true">{filtrosAtivos}</span>}
            </button>
          </div>
          {filtrosAbertos && (
            <QueueFilters
              id="filtros-painel"
              grupos={GRUPOS_FILTRO_PAINEL}
              filtros={filtros}
              onAlterar={alterarFiltro}
              onLimpar={limparFiltros}
              filtrosAtivos={filtrosAtivos}
            />
          )}

          {registrosFiltrados.length === 0 ? (
            <div className="empty-search" role="status">
              <p>Nenhum chamado da base demonstrativa corresponde aos filtros selecionados.</p>
              <div className="empty-search__actions">
                <button type="button" className="btn-clear" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="table-wrap amostra-wrap">
              <table className="table-amostra">
                <caption className="visually-hidden">Chamados da base demonstrativa que correspondem aos filtros</caption>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Abertura</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Região</th>
                    <th>Tipo de ocorrência</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((registro) => (
                    <tr key={registro.id}>
                      <td>{registro.id}</td>
                      <td>{formatarData(registro.dataAbertura)}</td>
                      <td>{registro.statusLabel}</td>
                      <td>
                        <span className={'prio prio-' + registro.prioridade}>{registro.prioridadeLabel.toUpperCase()}</span>
                      </td>
                      <td>{registro.regiaoLabel}</td>
                      <td>{registro.tipoOcorrencia}</td>
                      <td>{registro.responsavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="queue-foot">
            <p className="queue-count" aria-live="polite">
              {filtrosAtivos > 0
                ? 'Mostrando ' + registrosFiltrados.length + ' de ' + BASE_DEMONSTRATIVA.length + ' chamados da base demonstrativa'
                : 'Mostrando os ' + BASE_DEMONSTRATIVA.length + ' chamados da base demonstrativa'}
            </p>
          </div>
        </section>

        {/* Graficos em HTML/CSS: valores em graficos-demonstrativos.json (dados simulados e identificados).
            O BarChart calcula alturas e percentuais; os totais abaixo sao somados a partir dos mesmos dados. */}
        <section className="charts" aria-label="Gráficos">
          <article className="card chart-card">
            <div className="chart-head">
              <h2>Chamadas por Período</h2>
              <span className="tag-demo" title={graficos.documentacao.aviso}>Demonstrativo</span>
            </div>
            <p className="card-sub">Volume mensal e reincidências · {periodo}</p>
            <ul className="legend"><li>Chamadas</li><li className="legend-alt">Reincidências</li></ul>
            <BarChart titulo="Chamadas e reincidências por mês" grupos={gruposPeriodo} eixoX="Mês" />
            <p className="chart-total">
              Total: <strong>{formatar(totalPeriodo)}</strong> chamados · <strong>{formatar(totalReincidencias)}</strong> reincidências ({percentualReincidencias})
            </p>
          </article>

          <article className="card chart-card">
            <div className="chart-head">
              <h2>Chamadas por Prioridade</h2>
              <span className="tag-demo" title={graficos.documentacao.aviso}>Demonstrativo</span>
            </div>
            <p className="card-sub">Distribuição da criticidade · {periodo}</p>
            <ul className="legend is-hidden" aria-hidden="true"><li>.</li></ul>
            <BarChart titulo="Chamadas por prioridade" grupos={gruposPrioridade} simples eixoX="Prioridade" mostrarPercentual />
            <p className="chart-total">Total: <strong>{formatar(totalPrioridade)}</strong> chamados (100%)</p>
          </article>

          <article className="card chart-card">
            <div className="chart-head">
              <h2>Chamadas por Tipo de Ocorrência</h2>
              <span className="tag-demo" title={graficos.documentacao.aviso}>Demonstrativo</span>
            </div>
            <p className="card-sub">Concentração de falhas · {periodo}</p>
            <ul className="legend"><li>Chamadas</li></ul>
            <BarChart titulo="Chamadas por tipo de ocorrência" grupos={gruposTipo} simples eixoX="Tipo de ocorrência" mostrarPercentual />
            <p className="chart-total">Total: <strong>{formatar(totalTipo)}</strong> chamados (100%)</p>
          </article>
        </section>
        <p className="data-source charts-source">
          Gráficos com dados simulados · universo: operação consolidada (mesma base dos indicadores do topo,
          total de {insights.indicadores.itens.total.value} chamados), não apenas o contrato {painel.contrato}.
        </p>

        <section className="card" aria-labelledby="t-padroes">
          <h2 id="t-padroes">Padrões e Recorrências Identificadas</h2>
          <p className="card-sub">Correlação entre equipamento, ocorrência e histórico técnico</p>
          <div className="table-wrap">
            <table className="table-padroes">
              <thead>
                <tr>
                  <th>Equipamento</th><th>Local</th><th>Ocorrência</th><th>Eventos</th>
                  <th>Janela</th><th>Padrão</th><th>Ação recomendada</th>
                </tr>
              </thead>
              <tbody>
                {painel.padroes.map((item) => (
                  <tr key={item.equipamento}>
                    <td>{item.equipamento}</td>
                    <td>{item.local}</td>
                    <td>{item.ocorrencia}</td>
                    <td>{item.eventos}</td>
                    <td>{item.janela}</td>
                    <td><span className={'badge ' + classePadrao[item.padrao]}>{item.padrao}</span></td>
                    <td>{item.acaoRecomendada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" aria-labelledby="t-areas">
          <h2 id="t-areas">Performance por Área</h2>
          <p className="card-sub">TA, TB, SLA e reincidência por região</p>
          <div className="areas">
            {painel.areas.map((area) => (
              <article key={area.nome} className="area">
                <div className="area-head">
                  <span className="area-name">{area.nome}</span>
                  <span className="sla">SLA {area.sla}</span>
                </div>
                <dl className="metrics">
                  <div><dt>TA</dt><dd>{area.ta}</dd></div>
                  <div><dt>TB</dt><dd>{area.tb}</dd></div>
                  <div><dt>Técnicos</dt><dd>{area.tecnicos}</dd></div>
                  <div><dt>Reincid.</dt><dd>{area.reincidencia}</dd></div>
                </dl>
                {area.skill && (
                  <div className={'skill skill-' + classeNivel[area.skill.nivel]}>
                    <div className="skill-top">
                      <span className="skill-name">{area.skill.nome}</span>
                      <span className={'level ' + classeNivel[area.skill.nivel]}>{area.skill.nivel}</span>
                    </div>
                    <p className="skill-meta">{area.nome} · {area.skill.percentual}</p>
                    <div className="meter"><span style={{ width: area.skill.percentual }}></span></div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="card" aria-labelledby="t-reco">
          <h2 id="t-reco">Recomendações da Inteligência ORQUESTRA</h2>
          <p className="card-sub">Sugestões geradas a partir dos padrões — execução permanece nos sistemas responsáveis</p>
          <div className="reco-row">
            {painel.recomendacoes.map((reco) => (
              <article key={reco.titulo} className="reco">
                <span className="reco-icon">
                  <i className={(reco.icone === 'fa-clipboard' ? 'fa-regular ' : 'fa-solid ') + reco.icone} aria-hidden="true"></i>
                </span>
                <div>
                  <div className="reco-title">{reco.titulo} <span className="tag">{reco.tag}</span></div>
                  <p>{reco.descricao}</p>
                  <p className="gain">{reco.ganho}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default BackofficePainel
