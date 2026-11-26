import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import MenuDrawer from '../components/MenuDrawer.jsx'

// Layout principal da area Mobile: cabecalho, conteudo da rota (Outlet) e navegacao inferior.
// Alternancia Mobile/Desktop: feita por rotas (decisao do Ciclo 2, sem modo automatico).
//   Mobile  -> rotas de "/" (este layout)
//   Desktop -> rotas de "/backoffice" (BackofficeLayout)
//   Entrada no Desktop: botao "Acessar BackOffice" no menu hamburguer; retorno: "Voltar ao app Mobile" na sidebar.
function AppShellLayout() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="app-root app-root--mobile">
      <header className="app-header">
        <button
          className="header-start"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto(true)}
        >
          Menu
        </button>
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
      </nav>
      <MenuDrawer aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
    </div>
  )
}

export default AppShellLayout