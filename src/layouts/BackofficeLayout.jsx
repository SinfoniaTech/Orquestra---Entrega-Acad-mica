import { Outlet, NavLink, Link } from 'react-router-dom'

// Itens do menu lateral que ainda nao possuem tela (no original o link era "#")
const placeholdersBackoffice = [
  { icone: 'fa-regular fa-file-lines', label: 'Contratos' },
  { icone: 'fa-solid fa-building', label: 'Equipamentos' },
  { icone: 'fa-regular fa-user', label: 'Clientes' },
  { icone: 'fa-solid fa-cube', label: 'Peças' },
  { icone: 'fa-solid fa-user-gear', label: 'Técnicos' },
  { icone: 'fa-solid fa-graduation-cap', label: 'Treinamentos' },
  { icone: 'fa-solid fa-chart-column', label: 'Relatórios' },
]

const placeholdersSistema = [
  { icone: 'fa-solid fa-gear', label: 'Configurações' },
  { icone: 'fa-solid fa-plug', label: 'Integrações' },
  { icone: 'fa-solid fa-database', label: 'Logs de Carga' },
]

function ItemPlaceholder({ icone, label }) {
  return (
    <li>
      <span className="sidebar-item is-placeholder" title="Tela não disponível no protótipo">
        <i className={icone} aria-hidden="true"></i>{label}
      </span>
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
            <li>
              <NavLink to='/backoffice/painel'>
                <i className="fa-solid fa-table-cells-large" aria-hidden="true"></i>Painel Operacional
              </NavLink>
            </li>
            <ItemPlaceholder icone="fa-solid fa-chart-line" label="Painel Executivo" />
          </ul>
          <p className="sidebar-group">BACKOFFICE</p>
          <ul>
            <li>
              <NavLink to='/backoffice/chamados'>
                <i className="fa-solid fa-phone" aria-hidden="true"></i>Chamados
              </NavLink>
            </li>
            {placeholdersBackoffice.map((item) => (
              <ItemPlaceholder key={item.label} icone={item.icone} label={item.label} />
            ))}
          </ul>
          <p className="sidebar-group">SISTEMA</p>
          <ul>
            {placeholdersSistema.map((item) => (
              <ItemPlaceholder key={item.label} icone={item.icone} label={item.label} />
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
