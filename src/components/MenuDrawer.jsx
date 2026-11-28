// Componente: menu lateral moveis com atalho para o BackOffice

import { useEffect } from "react"
import { Link } from "react-router-dom"
import insights from "../data/insights.json"

export default function MenuDrawer({ aberto, onFechar }) {
  const opcoes = insights.more.opcoes
  const acessoBackoffice = opcoes.find((opcao) => opcao.tipo === "rota")
  const placeholders = opcoes.filter((opcao) => opcao.tipo !== "rota")

  useEffect(() => {
    if (!aberto) return
    function aoTeclar(e) {
      if (e.key === "Escape") onFechar()
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [aberto, onFechar])

  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = anterior }
  }, [aberto])

  if (!aberto) return null

  return (
    <div className="menu-overlay" onClick={onFechar}>
      <nav
        className="menu-drawer"
        aria-label="Menu principal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-drawer__header">
          <strong>Menu</strong>
          <button type="button" className="menu-drawer__close" onClick={onFechar} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        {acessoBackoffice && (
          <Link to={acessoBackoffice.href} className="more-cta" onClick={onFechar}>
            <span className="more-cta__icon" aria-hidden="true">
              <i className="fa-solid fa-table-cells-large"></i>
            </span>
            <span className="more-cta__text">
              <strong>Acessar BackOffice</strong>
              <small>Painel operacional e gestão de chamados</small>
            </span>
            <span className="more-cta__arrow" aria-hidden="true">›</span>
          </Link>
        )}

        <div className="more-list">
          {placeholders.map((opcao) => (
            <div key={opcao.label} className="more-item">
              <a href={opcao.href} className="more-link" onClick={onFechar}>
                {opcao.label}
                <span className="badge">placeholder</span>
              </a>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}