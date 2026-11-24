import { Navigate, useLocation } from 'react-router'
import { ACCESS_PROFILES } from '../../../shared/lib/accessProfiles.js'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'
import { LoadingPage } from '../../../shared/ui/LoadingPage.jsx'
import { useAuth } from '../../auth'
import { AwaitingCompanyPage } from '../pages/AwaitingCompanyPage.jsx'
import { useEmpresa } from '../hooks/useEmpresaContext.js'

export function RequireEmpresa({ children }) {
  const { status, retry } = useEmpresa()
  const { user } = useAuth()
  const location = useLocation()
  const isAdministrator = user?.perfil === ACCESS_PROFILES.ADMIN
  const isRegistrationRoute = location.pathname === '/empresa/cadastro'

  if (status === 'carregando') {
    return <LoadingPage message="Carregando os dados da empresa..." />
  }

  if (status === 'erro') {
    return (
      <main className="container py-5">
        <ErrorAlert onRetry={retry}>
          Não foi possível carregar os dados da empresa. Tente novamente.
        </ErrorAlert>
      </main>
    )
  }

  if (status === 'ativa' && isRegistrationRoute) {
    return <Navigate to="/empresa" replace />
  }

  if (status === 'ausente') {
    if (!isAdministrator) {
      return <AwaitingCompanyPage />
    }

    if (!isRegistrationRoute) {
      return <Navigate to="/empresa/cadastro" replace />
    }
  }

  return children
}
