import { useState } from 'react'
import insights from '../data/insights.json'
import painelDemonstrativo from '../data/painel-demonstrativo.json'
import {
  filtrarPorSelecao,
  montarGruposFiltro,
  opcoesDoCampo,
  contarSelecoes,
  alternarSelecao,
  SELECAO_VAZIA,
} from '../utils/filters.js'
import { calcularIndicadores, formatarDuracao, percentual } from '../utils/stats.js'
import BackofficeTopbar from '../components/backoffice/BackofficeTopbar.jsx'
import KpiList from '../components/backoffice/KpiList.jsx'
import BarChart from '../components/backoffice/BarChart.jsx'
import QueueFilters from '../components/backoffice/QueueFilters.jsx'

// ---------- Base demonstrativa (1.247 registros ficticios, jul-set 2025) ----------
// Fonte UNICA de todos os indicadores, graficos e da Performance por Regiao desta tela.
const DOC = painelDemonstrativo.documentacao
const BASE = painelDemonstrativo.chamados
const GRUPOS_FILTRO = montarGruposFiltro(BASE, DOC.rotulos)
const OPCOES = {
  status: GRUPOS_FILTRO[0].opcoes,
  prioridade: GRUPOS_FILTRO[1].opcoes,
  regiao: GRUPOS_FILTRO[2].opcoes,
  tipoOcorrencia: opcoesDoCampo(BASE, 'tipoOcorrencia', 'tipoOcorrencia', ['Nivelamento', 'Porta', 'Painel/comando', 'Segurança', 'Comunicação', 'Outros']),
}
const CONFIGURACAO = { prazosMin: DOC.prazosSlaMin, meses: DOC.periodo.meses }
const MESES = DOC.periodo.meses
const PERIODO = MESES[0].rotulo + '–' + MESES[MESES.length - 1].rotulo + ' ' + DOC.periodo.inicio.slice(0, 4)

// Tabela fixa de apresentacao das referencias (texto do JSON -> classe CSS do original)
const classePadrao = { 'Recorrência confirmada': 'badge-red', 'Em observação': 'badge-yellow' }

// Formatacao (pt-BR): 1247 -> "1.247" | 6.0 -> "6,0%" | null -> "—"
const formatarNumero = (valor) => valor.toLocaleString('pt-BR')

function formatarPercentual(valor) {
  if (valor === null) return '—'
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}

function BackofficePainel() {
  // Filtros do Painel (estado proprio, independente da tela Chamados).
  // Cada grupo guarda uma LISTA: lista vazia = "Todos". O painel de filtros inicia aberto.
  const [selecao, setSelecao] = useState(SELECAO_VAZIA)
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)

  // Um unico calculo alimenta KPIs, graficos e Performance por Regiao (mesmos registros filtrados)
  const selecionados = filtrarPorSelecao(BASE, selecao)
  const ind = calcularIndicadores(selecionados, OPCOES, CONFIGURACAO)
  const opcoesMarcadas = contarSelecoes(selecao)

  // Marca/desmarca uma opcao (valor null = "Todos" do grupo)
  function alterarFiltro(campo, valor) {
    setSelecao((anterior) => alternarSelecao(anterior, campo, valor))
  }

  function limparFiltros() {
    setSelecao(SELECAO_VAZIA)
  }

  // ---------- Seis KPIs (calculados) ----------
  function quantidadeDoStatus(valor) {
    const item = ind.porStatus.find((status) => status.valor === valor)
    return item ? item.quantidade : 0
  }

  const abertos = quantidadeDoStatus('aberto')
  const aguardandoSupervisor = quantidadeDoStatus('supervisor')
  const variacao = ind.variacaoMensal
  const notaVariacao =
    variacao.percentual === null
      ? 'sem base para comparação mensal'
      : (variacao.percentual > 0 ? '+' : '') + formatarPercentual(variacao.percentual) + ' ' +
        variacao.atual.toLowerCase() + ' vs. ' + variacao.anterior.toLowerCase()

  const kpis = {
    tipo: 'calculado',
    universo: DOC.universo,
    itens: {
      total: { label: 'Total de Chamadas', value: formatarNumero(ind.total), note: notaVariacao, tone: 'green' },
      abertas: {
        label: 'Abertas',
        value: formatarNumero(abertos + aguardandoSupervisor),
        note: abertos + ' sem atribuição · ' + aguardandoSupervisor + ' aguardando supervisor',
        tone: 'orange',
      },
      atendimento: {
        label: 'Em Atendimento',
        value: formatarNumero(quantidadeDoStatus('atendimento')),
        note: ind.criticasEmAtendimento + (ind.criticasEmAtendimento === 1 ? ' crítica' : ' críticas'),
        tone: 'red',
      },
      concluidas: {
        label: 'Concluídas',
        value: formatarNumero(ind.conclusao.concluidos),
        note: formatarPercentual(percentual(ind.conclusao.concluidos, ind.total)) + ' do total',
        tone: 'muted',
      },
      ta: {
        label: 'TA Médio',
        value: formatarDuracao(ind.taMedio.media),
        note: 'meta ' + formatarDuracao(DOC.metas.taMin) + ' · n = ' + formatarNumero(ind.taMedio.base),
        tone: 'green',
      },
      tb: {
        label: 'TB Médio',
        value: formatarDuracao(ind.tbMedio.media),
        note: 'meta ' + formatarDuracao(DOC.metas.tbMin) + ' · n = ' + formatarNumero(ind.tbMedio.base),
        tone: 'orange',
      },
    },
  }

  // ---------- Tres graficos (mesmos registros filtrados) ----------
  const totalReincidentes =
    'Total: ' + formatarNumero(ind.total) + ' chamados · ' + formatarNumero(ind.reincidencias) +
    ' reincidentes (' + formatarPercentual(percentual(ind.reincidencias, ind.total)) + ', já incluídos no total)'

  const totalChamados = 'Total: ' + formatarNumero(ind.total) + ' chamados'

  const graficos = [
    {
      chave: 'mes',
      titulo: 'Chamados por Mês',
      subtitulo: 'Volume mensal e chamados reincidentes',
      series: true,
      eixoX: 'Mês',
      grupos: ind.porMes.map((mes) => ({
        rotulo: mes.rotulo,
        barras: [
          { valor: mes.chamados, nome: 'Chamados' },
          { valor: mes.reincidencias, nome: 'Reincidentes', classe: 'is-alt' },
        ],
      })),
      rodape: totalReincidentes,
    },
    {
      chave: 'status',
      titulo: 'Chamados por Status',
      subtitulo: 'Situação atual dos chamados',
      eixoX: 'Status',
      percentual: true,
      grupos: ind.porStatus.map((item) => ({ rotulo: item.rotulo, barras: [{ valor: item.quantidade }] })),
      rodape: totalChamados,
    },
    {
      chave: 'prioridade',
      titulo: 'Chamados por Prioridade',
      subtitulo: 'Distribuição da criticidade',
      eixoX: 'Prioridade',
      percentual: true,
      grupos: ind.porPrioridade.map((item) => ({
        rotulo: item.rotulo,
        barras: [{ valor: item.quantidade, classe: 'p-' + item.valor }],
      })),
      rodape: totalChamados,
    },
  ]

  return (
    <>
      <BackofficeTopbar
        titulo="Painel Operacional"
        subtitulo="Padrões, recorrências, TA/TB e oportunidades de melhoria contínua da operação"
        periodo={PERIODO}
        buscaDesabilitada
      />
      <main className="app-content">
        <KpiList indicadores={kpis} chaves={['total', 'abertas', 'atendimento', 'concluidas', 'ta', 'tb']} legenda="" />

        {/* Filtros: alteram TODOS os elementos analiticos abaixo e os KPIs acima */}
        <section className="card" aria-labelledby="t-filtros-indicadores">
          <div className="card-head">
            <div>
              <h2 id="t-filtros-indicadores">Filtros dos indicadores</h2>
              <p className="card-sub">
                Marque uma ou mais opções em cada grupo (qualquer uma dentro do grupo; todas entre os grupos).
                Os indicadores, gráficos e a Performance por Região desta tela são recalculados.
              </p>
            </div>
            <button
              type="button"
              className="btn-filter"
              aria-label={(filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros') + (opcoesMarcadas > 0 ? ' (' + opcoesMarcadas + ' ativo(s))' : '')}
              aria-expanded={filtrosAbertos}
              aria-controls="filtros-painel"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              <i className="fa-solid fa-filter" aria-hidden="true"></i>
              {opcoesMarcadas > 0 && <span className="filter-count" aria-hidden="true">{opcoesMarcadas}</span>}
            </button>
          </div>

          {filtrosAbertos && (
            <QueueFilters
              id="filtros-painel"
              grupos={GRUPOS_FILTRO}
              filtros={selecao}
              onAlterar={alterarFiltro}
              onLimpar={limparFiltros}
              filtrosAtivos={opcoesMarcadas}
              multipla
            />
          )}

          {ind.total === 0 ? (
            <div className="empty-search" role="status">
              <p>Nenhum chamado da base demonstrativa corresponde aos filtros selecionados.</p>
              <div className="empty-search__actions">
                <button type="button" className="btn-clear" onClick={limparFiltros}>Limpar filtros</button>
              </div>
            </div>
          ) : (
            <p className="filters-resumo" aria-live="polite">
              <strong>{formatarNumero(ind.total)}</strong> de {formatarNumero(BASE.length)} chamados considerados
            </p>
          )}
        </section>

        {/* Graficos em HTML/CSS calculados sobre os registros filtrados */}
        <section className="charts" aria-label="Gráficos">
          {graficos.map((grafico) => (
            <article key={grafico.chave} className="card chart-card">
              <div className="chart-head">
                <h2>{grafico.titulo}</h2>
              </div>
              <p className="card-sub">{grafico.subtitulo} · {PERIODO}</p>
              {grafico.series ? (
                <ul className="legend">
                  <li>Chamados (total)</li>
                  <li className="legend-alt">Reincidentes (incluídos no total)</li>
                </ul>
              ) : (
                <ul className="legend is-hidden" aria-hidden="true"><li>.</li></ul>
              )}
              <BarChart
                titulo={grafico.titulo}
                grupos={grafico.grupos}
                simples={!grafico.series}
                eixoX={grafico.eixoX}
                mostrarPercentual={grafico.percentual === true}
              />
              <p className="chart-total">{grafico.rodape}</p>
            </article>
          ))}
        </section>

        {/* Performance por Regiao: mesmos registros filtrados, com os denominadores de cada calculo */}
        <section className="card" aria-labelledby="t-regioes">
          <h2 id="t-regioes">Performance por Região</h2>
          <p className="card-sub">
            TA, TB, SLA no prazo, reincidência e responsáveis por região · n = quantidade de registros usada em cada cálculo
          </p>
          <div className="areas">
            {ind.porRegiaoPerformance.map((regiao) => (
              <article key={regiao.valor} className={'area' + (regiao.total === 0 ? ' is-vazia' : '')}>
                <div className="area-head">
                  <span className="area-name">{regiao.rotulo}</span>
                  <span className="sla">{formatarNumero(regiao.total)} chamados</span>
                </div>
                {regiao.total === 0 ? (
                  <p className="area-vazia">Sem registros na seleção</p>
                ) : (
                  <dl className="metrics metrics--regiao">
                    <div><dt>TA médio</dt><dd>{formatarDuracao(regiao.taMedio.media)} <span className="metric-n">n = {regiao.taMedio.base}</span></dd></div>
                    <div><dt>TB médio</dt><dd>{formatarDuracao(regiao.tbMedio.media)} <span className="metric-n">n = {regiao.tbMedio.base}</span></dd></div>
                    <div><dt>SLA no prazo</dt><dd>{formatarPercentual(regiao.slaNoPrazo.percentual)} <span className="metric-n">n = {regiao.slaNoPrazo.base}</span></dd></div>
                    <div><dt>Reincidência</dt><dd>{formatarPercentual(regiao.reincidencia.percentual)} <span className="metric-n">n = {regiao.reincidencia.base}</span></dd></div>
                    <div><dt>Responsáveis</dt><dd>{regiao.responsaveis}</dd></div>
                  </dl>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Referencias do prototipo (insights.json): NAO usam a base demonstrativa e NAO respondem aos filtros */}
        <section className="ref-demo">
          <section className="card" aria-labelledby="t-padroes">
            <h2 id="t-padroes">Padrões e Recorrências Identificadas</h2>
            <p className="card-sub">Correlação entre equipamento, ocorrência e histórico técnico</p>
            <div className="table-wrap">
              <table className="table-padroes">
                <thead>
                  <tr>
                    <th>Equipamento</th>
                    <th>Local</th>
                    <th>Ocorrência</th>
                    <th>Eventos</th>
                    <th>Janela</th>
                    <th>Padrão</th>
                    <th>Ação recomendada</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.painelOperacional.padroes.map((item) => (
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

          <section className="card" aria-labelledby="t-reco">
            <h2 id="t-reco">Recomendações da Inteligência ORQUESTRA</h2>
            <p className="card-sub">Sugestões geradas a partir dos padrões — execução permanece nos sistemas responsáveis</p>
            <div className="reco-row">
              {insights.painelOperacional.recomendacoes.map((reco) => (
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
        </section>
      </main>
    </>
  )
}

export default BackofficePainel