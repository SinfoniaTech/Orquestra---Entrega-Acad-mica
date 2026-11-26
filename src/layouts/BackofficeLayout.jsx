import { Outlet, NavLink, Link } from 'react-router-dom'

const itensBackoffice = [
  { to: '/backoffice/contratos', icone: 'fa-regular fa-file-lines', label: 'Contratos' },
  { to: '/backoffice/equipamentos', icone: 'fa-solid fa-building', label: 'Equipamentos' },
  { to: '/backoffice/tecnicos', icone: 'fa-solid fa-user-gear', label: 'Técnicos' },
  { to: '/backoffice/treinamentos', icone: 'fa-solid fa-graduation-cap', label: 'Treinamentos' },
  { to: '/backoffice/relatorios', icone: 'fa-solid fa-chart-column', label: 'Relatórios' },
]

const itensSistema = [
  { to: '/backoffice/configuracoes', icone: 'fa-solid fa-gear', label: 'Configurações' },
]

function ItemMenu({ to, icone, label }) {
  return (
    <li>
      <NavLink to={to}>
        <i className={icone} aria-hidden="true"></i>{label}
      </NavLink>
    </li>
  )
}

function BackofficeLayout() {
  return (
    <div className="app-root app-root--backoffice">
      <aside className="sidebar">
        <p className="brand">Orquestra</p>
        <nav aria-label="Navegação do Backoffice">
          <ul>
            <ItemMenu to="/backoffice/painel" icone="fa-solid fa-table-cells-large" label="Painel Operacional" />
          </ul>
          <p className="sidebar-group">BACKOFFICE</p>
          <ul>
            <ItemMenu to="/backoffice/chamados" icone="fa-solid fa-phone" label="Chamados" />
            {itensBackoffice.map((item) => (
              <ItemMenu key={item.to} {...item} />
            ))}
          </ul>
          <p className="sidebar-group">SISTEMA</p>
          <ul>
            {itensSistema.map((item) => (
              <ItemMenu key={item.to} {...item} />
            ))}
            <li>
              <Link to='/'>
                <i className="fa-solid fa-mobile-screen" aria-hidden="true"></i>Voltar ao app Mobile
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}

export default BackofficeLayout