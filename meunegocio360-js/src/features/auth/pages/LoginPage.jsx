import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Navigate, useLocation } from 'react-router'
import logo from '../../../shared/assets/logo-meunegocio360.png'
import { Rodape } from '../../../shared/ui/Rodape'
import { AVISO_SESSAO_EXPIRADA, STATUS } from '../authContext'
import { LoginForm } from '../components/LoginForm'
import { destinoSeguro } from '../destinoSeguro'
import { useAuth } from '../hooks/useAuth'

/** Tela /login (RF-FE-001). Quem já está autenticado segue para a rota de origem ou "/". */
export default function LoginPage() {
  const { status, aviso } = useAuth()
  const location = useLocation()

  if (status === STATUS.AUTENTICADO) {
    return <Navigate to={destinoSeguro(location.state?.from)} replace />
  }

  return (
    <>
      <title>Entrar · MeuNegócio360</title>
      <main className="flex-grow-1 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={7} lg={5} xl={4}>
              <Card className="shadow-sm">
                <Card.Body className="p-4 p-sm-5">
                  <div className="text-center mb-4">
                    <img
                      src={logo}
                      alt="MeuNegócio360"
                      width={640}
                      height={412}
                      className="mn-logo-login img-fluid mb-3"
                    />
                    <h1 className="h2 mb-0">Entrar</h1>
                  </div>
                  {aviso === AVISO_SESSAO_EXPIRADA && (
                    <Alert variant="warning" className="mb-4">
                      Sua sessão expirou. Entre novamente.
                    </Alert>
                  )}
                  <LoginForm />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
      <Rodape />
    </>
  )
}
