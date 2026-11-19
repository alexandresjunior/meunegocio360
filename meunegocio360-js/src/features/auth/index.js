// API pública da feature de autenticação (RNF-FE-01).
import { lazy } from 'react'

export { AuthProvider } from './context/AuthProvider.jsx'
export { GuardaInicializacao } from './components/GuardaInicializacao.jsx'
export { RequireAuth } from './components/RequireAuth.jsx'
export { SomenteAnonimo } from './components/SomenteAnonimo.jsx'
export { useAuth } from './hooks/useAuth.js'
export { useUsuarioAtual } from './hooks/useUsuarioAtual.js'

// Página carregada sob demanda (RNF-FE-05).
export const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
