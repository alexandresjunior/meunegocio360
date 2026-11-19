import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ApiError,
  configurarSessao,
  renovarSessao,
} from '../../../shared/lib/http.js'
import { logout, refresh } from '../api/authApi.js'
import { AuthContext } from './authContext.js'

// Renovação preventiva cerca de 60 s antes de o token expirar (ciclo de vida, item 4).
const ANTECEDENCIA_RENOVACAO_S = 60
const ATRASO_MINIMO_RENOVACAO_S = 10

/**
 * Contexto de autenticação (RF-FE-001, "Ciclo de vida da sessão").
 *
 * O token de acesso fica SOMENTE em memória (ref); nada vai para localStorage
 * nem sessionStorage (RNF-FE-12). O refresh token é um cookie HttpOnly que o
 * JavaScript não lê nem grava.
 */
export function AuthProvider({ children }) {
  const [estado, setEstado] = useState({ status: 'carregando', usuario: null })
  const tokenRef = useRef(null)
  const agendamentoRef = useRef(null)
  const expirarRef = useRef(() => {})
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const cancelarAgendamento = useCallback(() => {
    clearTimeout(agendamentoRef.current)
    agendamentoRef.current = null
  }, [])

  const entrar = useCallback(
    (sessao) => {
      tokenRef.current = sessao.accessToken
      setEstado({ status: 'autenticado', usuario: sessao.usuario })

      cancelarAgendamento()
      const atraso = Math.max(
        sessao.expiresIn - ANTECEDENCIA_RENOVACAO_S,
        ATRASO_MINIMO_RENOVACAO_S,
      )
      agendamentoRef.current = setTimeout(() => {
        renovarSessao().catch((erro) => {
          // Falha de rede: a próxima chamada com 401 tenta de novo.
          if (erro instanceof ApiError && erro.status === 401) {
            expirarRef.current()
          }
        })
      }, atraso * 1000)
    },
    [cancelarAgendamento],
  )

  const limparSessao = useCallback(() => {
    cancelarAgendamento()
    tokenRef.current = null
    queryClient.clear()
    setEstado({ status: 'anonimo', usuario: null })
  }, [cancelarAgendamento, queryClient])

  const expirar = useCallback(() => {
    const { pathname, search, hash } = window.location
    limparSessao()
    navigate('/login', {
      replace: true,
      state: { from: `${pathname}${search}${hash}`, motivo: 'expirada' },
    })
  }, [limparSessao, navigate])

  useEffect(() => {
    expirarRef.current = expirar
  }, [expirar])

  // Registra no cliente HTTP como obter o token, renovar e expirar a sessão.
  useEffect(
    () =>
      configurarSessao({
        obterToken: () => tokenRef.current,
        renovar: async () => {
          const sessao = await refresh()
          entrar(sessao)
          return sessao.accessToken
        },
        aoExpirar: () => expirarRef.current(),
      }),
    [entrar],
  )

  const restaurar = useCallback(
    () =>
      renovarSessao().then(
        () => {}, // entrar() já atualizou o estado
        (erro) => {
          // Somente 401 significa "sem sessão"; rede/5xx mostram a tela de erro
          // sem apagar nada (RF-FE-001, "Comportamentos e mensagens").
          const semSessao = erro instanceof ApiError && erro.status === 401
          setEstado({ status: semSessao ? 'anonimo' : 'erro', usuario: null })
        },
      ),
    [],
  )

  // Inicialização: restaura a sessão pelo cookie de refresh. A renovação é
  // agrupada (single-flight), então a montagem dupla do StrictMode faz uma só chamada.
  useEffect(() => {
    restaurar()
  }, [restaurar])

  useEffect(() => cancelarAgendamento, [cancelarAgendamento])

  const tentarNovamente = useCallback(() => {
    setEstado({ status: 'carregando', usuario: null })
    restaurar()
  }, [restaurar])

  const sair = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Falha de rede no logout é ignorada (ciclo de vida, item 5).
    }
    limparSessao()
    navigate('/login', { replace: true })
  }, [limparSessao, navigate])

  const valor = useMemo(
    () => ({ ...estado, entrar, sair, tentarNovamente }),
    [estado, entrar, sair, tentarNovamente],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
