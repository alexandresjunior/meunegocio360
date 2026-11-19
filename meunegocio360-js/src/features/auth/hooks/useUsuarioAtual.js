import { useQuery } from '@tanstack/react-query'
import { me } from '../api/authApi.js'

/** Dados do usuário autenticado (GET /auth/me), via TanStack Query (RNF-FE-04). */
export function useUsuarioAtual() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => me({ signal }),
  })
}
