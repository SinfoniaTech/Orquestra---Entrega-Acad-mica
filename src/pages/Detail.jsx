import { Outlet, useParams, NavLink, Link } from 'react-router-dom'
import chamados from '../data/chamados-mobile.json'
import { NIVEIS } from '../utils/criticidade.js'
import NotFound from './NotFound.jsx'

// Estrutura comum das 3 abas do chamado: caminho, cabecalho, status e abas.
// O conteudo de cada aba e exibido no Outlet.
function Detail() {
  const { id } = useParams()
  const chamado = chamados.find((item) => item.id === id)

  if (!chamado) {
    return (
      <NotFound
        titulo="Chamado não encontrado"
        mensagem={'Não existe chamado com o identificador "' + id + '".'}
      />
    )
  }

  const nivel = NIVEIS[chamado.prioridade]

  return (
    <section className="page">
      <nav className="detail-breadcrumb" aria-label="Caminho">
        <Link to='/'>Chamados</Link> / <span>Chamado #{chamado.id}</span>
      </nav>
      <article className={'detail-screen ' + nivel.classe} aria-labelledby="detalhe-titulo">
        <header className="detail-heading">
          <Link className="detail-back" to='/'>← Chamados</Link>
          <div className="detail-statusline">
            <span className="criticality-label">{chamado.prioridadeLabel} · {nivel.cor}</span>
            <p>{chamado.statusline}</p>
          </div>
          <h1 id="detalhe-titulo">#{chamado.id}</h1>
          <nav className="call-tabs" aria-label="Detalhes do chamado">
            <NavLink to='resumo'>Resumo</NavLink>
            <NavLink to='linha-do-tempo'>Linha do Tempo</NavLink>
            <NavLink to='historico'>Histórico</NavLink>
          </nav>
        </header>
        <Outlet />
      </article>
    </section>
  )
}

export default Detail
