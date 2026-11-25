// Grafico de barras em HTML/CSS (sem biblioteca).
// Recebe os grupos por props e calcula a representacao visual a partir dos valores:
//   altura da barra = valor / maior valor do grafico * 100%
//   percentual      = valor / soma das barras * 100   (somente quando mostrarPercentual = true)
//
// Formato de "grupos": [{ rotulo: "Abr", barras: [{ valor: 185, classe: "", nome: "Chamadas" }] }]

// Formata numeros no padrao brasileiro: 1247 -> "1.247"
function formatarNumero(valor) {
  return valor.toLocaleString('pt-BR')
}

// Formata percentual com 1 casa decimal: 25.02 -> "25,0%"
function formatarPercentual(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}

export default function BarChart({
  grupos,
  titulo,
  simples = false,
  eixoX,
  eixoY = 'Nº de chamados',
  mostrarPercentual = false,
}) {
  // Maior valor (referencia de 100% da altura) e soma da primeira serie (base dos percentuais)
  let maior = 0
  let soma = 0
  grupos.forEach((grupo) => {
    soma = soma + grupo.barras[0].valor
    grupo.barras.forEach((barra) => {
      if (barra.valor > maior) maior = barra.valor
    })
  })

  function calcularAltura(valor) {
    if (maior === 0) return '0%'
    return (valor / maior) * 100 + '%'
  }

  function calcularPercentual(valor) {
    if (soma === 0) return 0
    return (valor / soma) * 100
  }

  // Muitas categorias com nomes longos: em telas estreitas os rotulos alternam de altura (ver CSS)
  const rotulosLongos = grupos.length > 5 && grupos.some((grupo) => grupo.rotulo.length > 8)

  // Descricao acessivel montada a partir dos dados exibidos
  const descricao = grupos
    .map((grupo) => {
      const valores = grupo.barras
        .map((barra) => (barra.nome ? barra.nome + ' ' : '') + formatarNumero(barra.valor))
        .join(', ')
      const percentual = mostrarPercentual ? ' (' + formatarPercentual(calcularPercentual(grupo.barras[0].valor)) + ')' : ''
      return grupo.rotulo + ': ' + valores + percentual
    })
    .join('; ')

  return (
    <figure className="chart">
      <figcaption className="visually-hidden">{titulo + '. ' + descricao + '.'}</figcaption>
      <p className="chart-axis chart-axis--y" aria-hidden="true">{eixoY}</p>
      <div className={'bars ' + (simples ? 'single' : '')} aria-hidden="true">
        {grupos.map((grupo) => (
          <div key={grupo.rotulo} className="bar-group">
            {grupo.barras.map((barra, indice) => (
              <span
                key={indice}
                className={'bar ' + (barra.classe || '')}
                style={{ height: calcularAltura(barra.valor) }}
              >
                {/* Valor sempre visivel acima da barra (nao depende de hover) */}
                <span className="bar-value">{formatarNumero(barra.valor)}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <ul className={'xlabels' + (rotulosLongos ? ' xlabels--alternados' : '')} aria-hidden="true">
        {grupos.map((grupo) => (
          <li key={grupo.rotulo}>
            <span className="xlabel-text">{grupo.rotulo}</span>
            {mostrarPercentual && (
              <span className="xlabel-pct">{formatarPercentual(calcularPercentual(grupo.barras[0].valor))}</span>
            )}
          </li>
        ))}
      </ul>
      {eixoX && <p className="chart-axis chart-axis--x" aria-hidden="true">{eixoX}</p>}
    </figure>
  )
}
