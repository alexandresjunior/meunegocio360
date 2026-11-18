import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { ApiError, configureAuth } from '../../../shared/lib/http'
import * as authApi from '../api/authApi'
import { AVISO_SESSAO_EXPIRADA, AuthContext, STATUS } from '../authContext'

// Renova cerca de 60 s antes de o token de acesso expirar (ciclo de vida, item 4).
const ANTECEDENCIA_RENOVACAO_MS = 60_000

const estadoInicial = { status: STATUS.CARREGANDO, usuario: null, aviso: null }

function reducer(estado, acao) {
  switch (acao.type) {
    case 'carregando':
      return { ...estado, status: STATUS.CARREGANDO }
    case 'autenticado':
      return { status: STATUS.AUTENTICADO, usuario: acao.usuario, aviso: null }
    case 'anonimo':
      return { status: STATUS.ANONIMO, usuario: null, aviso: acao.aviso ?? null }
    case 'erro':
      return { ...estado, status: STATUS.ERRO }
    default:
      return estado
  }
}

/**
 * Sessão do usuário (RF-FE-001). O token de acesso fica só em memória (ref), nunca em
 * localStorage/sessionStorage; o refresh token é o cookie HttpOnly, invisível ao JavaScript
 * (RNF-FE-12).
 */
export function AuthProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const tokenRef = useRef(null)
  const temporizadorRef = useRef(null)
  const queryClient = useQueryClient()

  const cancelarRenovacaoAgendada = useCallback(() => {
    clearTimeout(temporizadorRef.current)
    temporizadorRef.current = null
  }, [])

  const encerrarLocalmente = useCallback(
    (aviso) => {
      cancelarRenovacaoAgendada()
      tokenRef.current = null
      queryClient.clear()
      dispatch({ type: 'anonimo', aviso })
    },
    [cancelarRenovacaoAgendada, queryClient],
  )

  // Declarada antes de usada; a referência circular com aplicarSessao é resolvida pela ref.
  const renovarRef = useRef(null)

  const aplicarSessao = useCallback(
    (sessao) => {
      tokenRef.current = sessao.accessToken
      cancelarRenovacaoAgendada()
      const atraso = Math.max(0, sessao.expiresIn * 1000 - ANTECEDENCIA_RENOVACAO_MS)
      temporizadorRef.current = setTimeout(() => renovarRef.current?.(), atraso)
      dispatch({ type: 'autenticado', usuario: sessao.usuario })
    },
    [cancelarRenovacaoAgendada],
  )

  /** Usada pelo cliente HTTP diante de um 401 e pela renovação preventiva. */
  const renovar = useCallback(async () => {
    const sessao = await authApi.refresh()
    aplicarSessao(sessao)
    return sessao.accessToken
  }, [aplicarSessao])

  const renovarPreventivamente = useCallback(async () => {
    try {
      await renovar()
    } catch (erro) {
      // Falha de rede não encerra a sessão: o próximo 401 tentará renovar de novo.
      if (erro instanceof ApiError && erro.status === 401) {
        encerrarLocalmente(AVISO_SESSAO_EXPIRADA)
      }
    }
  }, [renovar, encerrarLocalmente])

  useEffect(() => {
    renovarRef.current = renovarPreventivamente
  }, [renovarPreventivamente])

  useEffect(
    () =>
      configureAuth({
        getAccessToken: () => tokenRef.current,
        renovarSessao: renovar,
        aoExpirarSessao: () => encerrarLocalmente(AVISO_SESSAO_EXPIRADA),
      }),
    [renovar, encerrarLocalmente],
  )

  /** Restauração de sessão: só 401 leva a "anônimo"; falha de rede/5xx vira tela de erro. */
  const restaurar = useCallback(
    async (seAtivo = () => true) => {
      try {
        const sessao = await authApi.refresh()
        if (seAtivo()) aplicarSessao(sessao)
      } catch (erro) {
        if (!seAtivo()) return
        if (erro instanceof ApiError && erro.status === 401) {
          dispatch({ type: 'anonimo' })
        } else {
          dispatch({ type: 'erro' })
        }
      }
    },
    [aplicarSessao],
  )

  useEffect(() => {
    // No StrictMode o efeito roda duas vezes; o single-flight de authApi.refresh garante uma
    // única chamada, e a flag descarta o resultado da montagem desfeita.
    let ativo = true
    restaurar(() => ativo)
    return () => {
      ativo = false
    }
  }, [restaurar])

  useEffect(() => cancelarRenovacaoAgendada, [cancelarRenovacaoAgendada])

  const tentarNovamente = useCallback(() => {
    dispatch({ type: 'carregando' })
    restaurar()
  }, [restaurar])

  const entrar = useCallback(
    async (credenciais) => {
      const sessao = await authApi.login(credenciais)
      aplicarSessao(sessao)
      return sessao.usuario
    },
    [aplicarSessao],
  )

  const sair = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Falha de rede no logout é ignorada: a sessão local é encerrada de qualquer forma.
    }
    encerrarLocalmente(null)
  }, [encerrarLocalmente])

  const valor = useMemo(
    () => ({ ...estado, entrar, sair, tentarNovamente }),
    [estado, entrar, sair, tentarNovamente],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
