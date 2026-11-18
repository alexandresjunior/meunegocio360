import { Suspense } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import { Outlet } from 'react-router'
import { Carregando } from '../shared/ui/Carregando'
import { STATUS, useAuth } from '../features/auth'

/**
 * Raiz das rotas: enquanto a sessão é restaurada, não renderiza login nem telas protegidas
 * (evita o "piscar" da tela de login). Falha de rede/5xx na restauração mostra erro com
 * "Tentar novamente", sem tratar como sessão inválida.
 */
export function RootLayout() {
  const { status, tentarNovamente } = useAuth()

  if (status === STATUS.CARREGANDO) {
    return <Carregando mensagem="Carregando sua sessão…" />
  }

  if (status === STATUS.ERRO) {
    return (
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <title>Erro de conexão · MeuNegócio360</title>
        <Container className="text-center" style={{ maxWidth: '32rem' }}>
          <h1 className="h3">Não foi possível conectar</h1>
          <Alert variant="danger" className="my-4">
            Não conseguimos falar com o servidor. Verifique sua conexão e tente novamente.
          </Alert>
          <Button variant="primary" onClick={tentarNovamente}>
            Tentar novamente
          </Button>
        </Container>
      </main>
    )
  }

  return (
    <Suspense fallback={<Carregando />}>
      <Outlet />
    </Suspense>
  )
}
