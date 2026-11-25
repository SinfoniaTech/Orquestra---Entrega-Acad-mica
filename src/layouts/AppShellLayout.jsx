import { Outlet, NavLink, Link } from 'react-router-dom'

// Layout principal da area Mobile: cabecalho, conteudo da rota (Outlet) e navegacao inferior.
// Alternancia Mobile/Desktop: feita por rotas (decisao do Ciclo 2, sem modo automatico).
//   Mobile  -> rotas de "/" (este layout)
//   Desktop -> rotas de "/backoffice" (BackofficeLayout)
//   Entrada no Desktop: botao "Acessar BackOffice" no Menu Mais; retorno: "Voltar ao app Mobile" na sidebar.
function AppShellLayout() {
  return (
    <div className="app-root app-root--mobile">
      <header className="app-header">
        {/* No original o botao de menu e apenas visual (sem acao) */}
        <button className="header-start" type="button" aria-label="Abrir menu">Menu</button>
        <Link to='/' className="header-brand" aria-label="ORQUESTRA, início">ORQUESTRA</Link>
        <Link to='/alertas' className="bell-link" aria-label="Abrir alertas">
          <i className="fa-regular fa-bell" aria-hidden="true"></i>
        </Link>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <nav className="bottom-navigation" aria-label="Navegacao principal">
        <NavLink to='/' className='nav-link' end>Chamados</NavLink>
        <NavLink to='/alertas' className='nav-link'>Alertas</NavLink>
        <NavLink to='/mais' className='nav-link'>Mais</NavLink>
      </nav>
    </div>
  )
}

export default AppShellLayout
