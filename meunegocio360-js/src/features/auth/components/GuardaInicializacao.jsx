import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import TelaCarregando from '../../../shared/ui/TelaCarregando.jsx'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Enquanto a sessão é restaurada, não renderiza rotas (nem a tela de login nem as
 * protegidas), para evitar o "flash" da tela de login. Falha de rede/5xx na
 * restauração mostra "Tentar novamente" sem apagar a sessão (RF-FE-001).
 */
export function GuardaInicializacao({ children }) {
  const { status, tentarNovamente } = useAuth()

  if (status === 'carregando') {
    return <TelaCarregando mensagem="Verificando sua sessão…" />
  }

  if (status === 'erro') {
    return (
      <main className="container min-vh-100 d-flex flex-column align-items-center justify-content-center py-4 text-center">
        <h1>Não foi possível conectar</h1>
        <Alert variant="danger" role="alert" className="my-3">
          Não conseguimos falar com o servidor agora. Verifique sua conexão e
          tente novamente.
        </Alert>
        <Button variant="primary" size="lg" onClick={tentarNovamente}>
          Tentar novamente
        </Button>
      </main>
    )
  }

  return children
}
