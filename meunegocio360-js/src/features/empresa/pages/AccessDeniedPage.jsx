import { Link } from 'react-router'
import { Alert } from 'react-bootstrap'

export function AccessDeniedPage() {
  return (
    <main className="container py-5">
      <Alert variant="warning" role="alert">
        <h1 className="h2">Acesso negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <Link to="/">Voltar ao início</Link>
      </Alert>
    </main>
  )
}
