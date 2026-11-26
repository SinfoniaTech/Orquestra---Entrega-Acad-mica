import { Link } from 'react-router-dom'

function EmDesenvolvimento({
  titulo,
  voltarPara = '/backoffice/painel',
  voltarTexto = 'Voltar para o Painel Operacional',
}) {
  return (
    <section className="in-development">
      <div className="in-development__card">
        <span className="in-development__icon" aria-hidden="true">
          <i className="fa-solid fa-screwdriver-wrench"></i>
        </span>
        <h1>{titulo}</h1>
        <p>Esta tela está em desenvolvimento e ainda não está disponível no protótipo.</p>
        <Link to={voltarPara} className="in-development__link">{voltarTexto}</Link>
      </div>
    </section>
  )
}

export default EmDesenvolvimento