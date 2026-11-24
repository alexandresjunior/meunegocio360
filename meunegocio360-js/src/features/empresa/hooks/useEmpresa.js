import { useQuery } from '@tanstack/react-query'
import { ACCESS_PROFILES } from '../../../shared/lib/accessProfiles.js'
import { useAuth } from '../../auth'
import {
  empresaQueryKeys,
  getActiveCompany,
  getInactiveCompanies,
} from '../api/empresaApi.js'

export function useActiveEmpresaQuery() {
  const { user, status } = useAuth()

  return useQuery({
    queryKey: empresaQueryKeys.active,
    queryFn: getActiveCompany,
    enabled: status === 'authenticated' && Boolean(user),
  })
}

export function useInactiveEmpresasQuery(page = 0, size = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: empresaQueryKeys.inactive(page, size),
    queryFn: () => getInactiveCompanies({ page, size }),
    enabled: user?.perfil === ACCESS_PROFILES.ADMIN,
  })
}
