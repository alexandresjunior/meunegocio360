import { Navigate, Outlet, useLocation } from 'react-router'
import { STATUS } from '../authContext'
import { useAuth } from '../hooks/useAuth'

/**
 * Guarda de rotas protegidas (RNF-FE-13). Sem sessão, leva ao login preservando a rota de origem.
 * É só experiência de uso: quem autoriza de fato é o backend.
 */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status !== STATUS.AUTENTICADO) {
    const origem = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from: origem }} />
  }
  return <Outlet />
}
