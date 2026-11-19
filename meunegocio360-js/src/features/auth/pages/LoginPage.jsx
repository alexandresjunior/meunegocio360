import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import { useLocation } from 'react-router'
import logo from '../../../assets/logo-meunegocio360.png'
import { useDocumentTitle } from '../../../shared/lib/useDocumentTitle.js'
import { FormularioLogin } from '../components/FormularioLogin.jsx'

// Dimensões intrínsecas do logo, declaradas para evitar deslocamento de layout.
const LOGO_LARGURA = 2400
const LOGO_ALTURA = 1792

/**
 * Tela /login (RF-FE-001, "Telas e rotas"): card centralizado com o logo acima
 * dos campos e o título "Entrar". O redirecionamento após o login fica com
 * <SomenteAnonimo>, que respeita a rota de origem.
 */
export default function LoginPage() {
  useDocumentTitle('Entrar')
  const location = useLocation()
  const sessaoExpirada = location.state?.motivo === 'expirada'

  return (
    <main className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
      <Card className="mn-auth-card w-100 shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-3">
            <img
              src={logo}
              alt="MeuNegocio360"
              width={LOGO_LARGURA}
              height={LOGO_ALTURA}
              className="mn-auth-logo img-fluid"
            />
          </div>
          <h1 className="text-center mb-4">Entrar</h1>

          {sessaoExpirada && (
            <Alert variant="warning" role="alert" transition={false}>
              Sua sessão expirou. Entre novamente.
            </Alert>
          )}

          <FormularioLogin />
        </Card.Body>
      </Card>
    </main>
  )
}
