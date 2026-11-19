import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Guarda de rotas protegidas (RNF-FE-13): sem sessão, leva ao login guardando a
 * rota de origem. É apenas UX; a autorização real é feita pelo backend.
 */
export function RequireAuth({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status !== 'autenticado') {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from }} />
  }

  return children
}
