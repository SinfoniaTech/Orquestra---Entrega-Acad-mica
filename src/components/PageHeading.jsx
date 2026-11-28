// Componente: titulo padrao das telas moveis
export default function PageHeading({ titulo, subtitulo }) {
  return (
    <section className="page-heading">
      <h1>{titulo}</h1>
      {subtitulo && <p>{subtitulo}</p>}
    </section>
  )
}
