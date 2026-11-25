// Titulo padrao das telas Mobile (classe .page-heading do original)
export default function PageHeading({ titulo, subtitulo }) {
  return (
    <section className="page-heading">
      <h1>{titulo}</h1>
      {subtitulo && <p>{subtitulo}</p>}
    </section>
  )
}
