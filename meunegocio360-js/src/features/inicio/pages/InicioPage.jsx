import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Spinner from 'react-bootstrap/Spinner'
import { Rodape } from '../../../shared/ui/Rodape'
import { useAuth } from '../../auth'

const NOME_DO_PERFIL = { ADMIN: 'Administrador', USUARIO: 'Usuário' }

/** Página inicial provisória (RF-FE-001): saudação, perfil e botão Sair. */
export default function InicioPage() {
  const { usuario, sair } = useAuth()
  const [saindo, setSaindo] = useState(false)

  const aoSair = async () => {
    setSaindo(true)
    await sair()
  }

  return (
    <>
      <title>Início · MeuNegócio360</title>
      <header>
        <Navbar bg="primary" data-bs-theme="light">
          <Container>
            <Navbar.Brand as="span" className="fw-semibold">
              MeuNegócio360
            </Navbar.Brand>
            <Button variant="outline-dark" onClick={aoSair} disabled={saindo}>
              {saindo && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  aria-hidden="true"
                  className="me-2"
                />
              )}
              Sair
            </Button>
          </Container>
        </Navbar>
      </header>
      <main className="flex-grow-1 py-5">
        <Container>
          <h1>Olá, {usuario.nome}!</h1>
          <p className="lead text-body-secondary">
            Perfil: {NOME_DO_PERFIL[usuario.perfil] ?? usuario.perfil}
          </p>
        </Container>
      </main>
      <Rodape />
    </>
  )
}
