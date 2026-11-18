// API pública da feature de autenticação (RNF-FE-01).
import { lazy } from 'react'

export { AuthProvider } from './components/AuthProvider'
export { RequireAuth } from './components/RequireAuth'
export { useAuth } from './hooks/useAuth'
export { STATUS } from './authContext'

export const LoginPage = lazy(() => import('./pages/LoginPage'))
