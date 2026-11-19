import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'

/** Rota "*": página não encontrada com link para a página inicial (RF-FE-001). */
export default function PaginaNaoEncontrada() {
  useDocumentTitle('Página não encontrada')

  return (
    <main className="container py-5 text-center">
      <h1>Página não encontrada</h1>
      <p className="text-body-secondary">
        O endereço acessado não existe ou foi removido.
      </p>
      <Link to="/">Ir para a página inicial</Link>
    </main>
  )
}
