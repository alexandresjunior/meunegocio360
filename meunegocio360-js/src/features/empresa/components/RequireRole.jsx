import { useAuth } from '../../auth'
import { AccessDeniedPage } from '../pages/AccessDeniedPage.jsx'

export function RequireRole({ roles, children }) {
  const { user } = useAuth()

  if (!roles.includes(user?.perfil)) {
    return <AccessDeniedPage />
  }

  return children
}
