import { Link } from "react-router-dom"
import insights from "../data/insights.json"
import PageHeading from "../components/PageHeading.jsx"

export default function More() {
  const opcoes = insights.more.opcoes;
  // A opcao do tipo "rota" (Backoffice) ganha destaque; as demais formam a lista comum
  const acessoBackoffice = opcoes.find((opcao) => opcao.tipo === "rota")
  const placeholders = opcoes.filter((opcao) => opcao.tipo !== "rota")

  return (
    <section className="page">
      <PageHeading titulo="Mais" subtitulo="Acesso a outras opções" />

      {acessoBackoffice && (
        <Link to={acessoBackoffice.href} className="more-cta">
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
            <a href={opcao.href} className="more-link">
              {opcao.label}
              <span className="badge">placeholder</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
