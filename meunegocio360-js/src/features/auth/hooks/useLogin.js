import { useMutation } from '@tanstack/react-query'
import { useAuth } from './useAuth'

/** Envio do formulário de login como mutação do TanStack Query (RNF-FE-04). */
export function useLogin() {
  const { entrar } = useAuth()
  return useMutation({ mutationFn: entrar })
}
