import { useEffect } from 'react'
import { Alert, Card } from 'react-bootstrap'
import { useLocation } from 'react-router'
import { useAuth } from '../../auth'
import { useEmpresa } from '../../empresa'

function HomePage() {
  const { user } = useAuth()
  const { empresa } = useEmpresa()
  const location = useLocation()

  useEffect(() => {
    document.title = 'Início | MeuNegocio360'
  }, [])

  return (
    <main className="container py-4 py-md-5">
      <h1 className="h2 mb-4">Início</h1>
      {location.state?.companyCreated && (
        <Alert variant="success" role="status" aria-live="polite">
          Empresa cadastrada com sucesso.
        </Alert>
      )}
      {location.state?.companyReactivated && (
        <Alert variant="success" role="status" aria-live="polite">
          Empresa reativada com sucesso.
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="h3">Olá, {user.nome}</h2>
          <p>
            <strong>Empresa:</strong>{' '}
            {empresa.nomeFantasia || empresa.razaoSocial}
          </p>
          <p className="mb-1">
            <strong>Perfil:</strong> {user.perfil}
          </p>
          <p className="mb-0">
            <strong>E-mail:</strong> {user.email}
          </p>
        </Card.Body>
      </Card>
    </main>
  )
}

export default HomePage
