// Componente: redireciona rotas antigas de criticidade para a home

import { Navigate, useParams } from "react-router-dom"
import { NIVEIS } from "../utils/criticidade.js"
import NotFound from "./NotFound.jsx"

function RedirecionaCriticidade() {
  const { nivel } = useParams()

  if (!NIVEIS[nivel]) {
    return (
      <NotFound
        titulo="Criticidade não encontrada"
        mensagem={'O nível "' + nivel + '" não existe. Use: crítica, alta, média ou normal.'}
      />
    )
  }

  return <Navigate to="/" replace state={{ filtro: nivel }} />
}

export default RedirecionaCriticidade
