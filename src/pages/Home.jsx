// Tela inicial: lista de chamados com filtro por criticidade

import { useState } from "react"
import { useLocation } from "react-router-dom"
import chamados from "../data/chamados-mobile.json"
import { NIVEIS } from "../utils/criticidade.js"
import { filtrarPorCriticidade } from "../utils/filters.js"
import PageHeading from "../components/PageHeading.jsx"
import CriticalityFilter from "../components/CriticalityFilter.jsx"
import CallList from "../components/calls/CallList.jsx"

export default function Home() {
  const location = useLocation()
  const filtroRecebido = location.state ? location.state.filtro : null
  const filtroInicial = NIVEIS[filtroRecebido] ? filtroRecebido : null

  const [filtro, setFiltro] = useState(filtroInicial)

  function selecionarFiltro(nivel) {
    if (nivel === filtro) {
      setFiltro(null)
    } else {
      setFiltro(nivel)
    }
  }

  const lista = filtrarPorCriticidade(chamados, filtro)
  const titulo = filtro ? "Chamados · " + NIVEIS[filtro].titulo : "Chamados abertos"


  return (
    <section className="page">
      <PageHeading titulo="Chamados" subtitulo={chamados.length + " eventos ativos agora"} />
      <CriticalityFilter filtroAtivo={filtro} onSelecionar={selecionarFiltro} />
      <h2 className="list-title" aria-live="polite">
        {titulo} <span className="list-count">({lista.length})</span>
      </h2>
      <CallList
        chamados={lista}
        mensagemVazia={filtro ? "Nenhum chamado com criticidade " + NIVEIS[filtro].menu.toLowerCase() + " no momento." : undefined}
        onLimpar={filtro ? () => setFiltro(null) : undefined}
      />
    </section>
  )
}
