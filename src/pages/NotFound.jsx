// Componente: pagina nao encontrada

import { Link } from 'react-router-dom'

export default function NotFound({
  titulo = 'Página não encontrada',
  mensagem = 'O endereço acessado não existe ou foi alterado.',
  voltarPara = '/',
  voltarTexto = 'Voltar para Chamados',
}) {
  return (
    <section className="page not-found">
      <div className="not-found__card">
        <span className="not-found__icon" aria-hidden="true">?</span>
        <h1>{titulo}</h1>
        <p>{mensagem}</p>
        <Link to={voltarPara} className="not-found__link">{voltarTexto}</Link>
      </div>
    </section>
  )
}
