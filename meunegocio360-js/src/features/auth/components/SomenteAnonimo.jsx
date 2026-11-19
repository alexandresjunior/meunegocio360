import { Navigate, useLocation } from 'react-router'
import { caminhoSeguro } from '../../../shared/lib/caminhoSeguro.js'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Rota pública de login: quem já está autenticado (inclusive logo após entrar)
 * é levado à rota de origem, desde que interna, ou a "/" (RF-FE-001).
 */
export function SomenteAnonimo({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'autenticado') {
    return <Navigate to={caminhoSeguro(location.state?.from)} replace />
  }

  return children
}
