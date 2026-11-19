import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Spinner from 'react-bootstrap/Spinner'
import { useDocumentTitle } from '../../../shared/lib/useDocumentTitle.js'
import { useAuth, useUsuarioAtual } from '../../auth/index.js'

/**
 * Página inicial provisória (RF-FE-001): saudação, perfil e botão Sair.
 * Os dados vêm de GET /auth/me, uma chamada autenticada que passa pela
 * renovação transparente do cliente HTTP. Será substituída pelo dashboard.
 */
export default function HomePage() {
  useDocumentTitle('Início')
  const { usuario, sair } = useAuth()
  const consulta = useUsuarioAtual()
  const [saindo, setSaindo] = useState(false)

  function aoSair() {
    setSaindo(true)
    sair()
  }

  return (
    <>
      <header>
        <Navbar bg="primary">
          <Container>
            <Navbar.Brand as="span" className="fw-semibold">
              MeuNegocio360
            </Navbar.Brand>
            <Button
              variant="outline-dark"
              onClick={aoSair}
              disabled={saindo}
              className="py-2"
            >
              {saindo ? 'Saindo…' : 'Sair'}
            </Button>
          </Container>
        </Navbar>
      </header>

      <main className="container py-5">
        <h1 className="mb-4">Olá, {usuario?.nome}</h1>

        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title as="h2" className="h4">
              Seus dados
            </Card.Title>

            {consulta.isPending && (
              <div role="status" className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" aria-hidden="true" />
                <span>Carregando seus dados…</span>
              </div>
            )}

            {consulta.isError && (
              <Alert variant="danger" role="alert" transition={false}>
                <p>
                  <strong>Erro:</strong> não foi possível carregar seus dados.
                </p>
                <Button
                  variant="outline-dark"
                  onClick={() => consulta.refetch()}
                >
                  Tentar novamente
                </Button>
              </Alert>
            )}

            {consulta.isSuccess && (
              <dl className="row mb-0">
                <dt className="col-sm-3">E-mail</dt>
                <dd className="col-sm-9">{consulta.data.email}</dd>
                <dt className="col-sm-3">Perfil</dt>
                <dd className="col-sm-9 mb-0">{consulta.data.perfil}</dd>
              </dl>
            )}
          </Card.Body>
        </Card>
      </main>
    </>
  )
}
