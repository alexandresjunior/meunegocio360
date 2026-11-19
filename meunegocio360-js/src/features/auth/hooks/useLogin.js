import { useMutation } from '@tanstack/react-query'
import { login } from '../api/authApi.js'
import { useAuth } from './useAuth.js'

/** Envia as credenciais e, com sucesso, guarda a sessão em memória. */
export function useLogin() {
  const { entrar } = useAuth()
  return useMutation({ mutationFn: login, onSuccess: entrar })
}
