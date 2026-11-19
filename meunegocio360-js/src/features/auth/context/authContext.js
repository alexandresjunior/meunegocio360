import { createContext } from 'react'

/**
 * Estado da sessão (RNF-FE-04):
 * - status: 'carregando' | 'autenticado' | 'anonimo' | 'erro'
 * - usuario: { id, nome, email, perfil } | null
 * - entrar(sessao), sair(), tentarNovamente()
 */
export const AuthContext = createContext(null)
