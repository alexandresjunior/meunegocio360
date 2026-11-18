import { createContext } from 'react'

export const AuthContext = createContext(null)

/** Estados da sessão (ciclo de vida do RF-FE-001). */
export const STATUS = Object.freeze({
  CARREGANDO: 'carregando',
  AUTENTICADO: 'autenticado',
  ANONIMO: 'anonimo',
  ERRO: 'erro',
})

export const AVISO_SESSAO_EXPIRADA = 'SESSAO_EXPIRADA'
