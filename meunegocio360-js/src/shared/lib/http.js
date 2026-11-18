// Cliente HTTP único da aplicação (RNF-FE-03, RNF-FE-10, RNF-FE-11).
// Não conhece nenhuma feature: a sessão se registra nele por configureAuth (RNF-FE-01).

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const TIMEOUT_PADRAO_MS = 15_000

/** Erro tipado: o comportamento da interface decide pelo `code`, nunca pelo texto (RNF-FE-14). */
export class ApiError extends Error {
  constructor({ status, code, detail, errors = [], retryAfterSegundos = null }) {
    super(detail ?? code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
    this.errors = errors
    this.retryAfterSegundos = retryAfterSegundos
  }
}

let sessao = {
  getAccessToken: () => null,
  renovarSessao: null,
  aoExpirarSessao: null,
}

/** Registra as funções da sessão. Retorna a função que desfaz o registro. */
export function configureAuth(handlers) {
  sessao = { ...sessao, ...handlers }
  return () => {
    sessao = { getAccessToken: () => null, renovarSessao: null, aoExpirarSessao: null }
  }
}

/**
 * Faz uma requisição à API.
 * - `auth`: injeta o token de acesso e, diante de 401, tenta UMA renovação e repete a chamada.
 * - Rotas de autenticação usam `auth: false`, o que impede o laço infinito de renovação.
 */
export async function request(
  caminho,
  { method = 'GET', body, auth = true, timeoutMs = TIMEOUT_PADRAO_MS, signal } = {},
) {
  const resposta = await enviar(caminho, { method, body, auth, timeoutMs, signal })

  if (resposta.status === 401 && auth && sessao.renovarSessao) {
    await renovarOuEncerrar()
    const repetida = await enviar(caminho, { method, body, auth, timeoutMs, signal })
    return interpretar(repetida)
  }
  return interpretar(resposta)
}

async function renovarOuEncerrar() {
  try {
    await sessao.renovarSessao()
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401) {
      sessao.aoExpirarSessao?.()
    }
    throw erro
  }
}

async function enviar(caminho, { method, body, auth, timeoutMs, signal }) {
  const headers = {
    Accept: 'application/json, application/problem+json',
    'X-Request-Id': crypto.randomUUID(),
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = auth ? sessao.getAccessToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const controlador = new AbortController()
  const temporizador = setTimeout(
    () => controlador.abort(new DOMException('timeout', 'TimeoutError')),
    timeoutMs,
  )
  const sinal = signal ? AbortSignal.any([signal, controlador.signal]) : controlador.signal

  try {
    return await fetch(`${BASE_URL}${caminho}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      signal: sinal,
    })
  } catch (erro) {
    if (controlador.signal.aborted) {
      throw new ApiError({
        status: 0,
        code: 'TIMEOUT',
        detail: 'A requisição excedeu o tempo limite.',
      })
    }
    if (signal?.aborted) {
      throw erro
    }
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      detail: 'Falha de comunicação com o servidor.',
    })
  } finally {
    clearTimeout(temporizador)
  }
}

async function interpretar(resposta) {
  if (resposta.status === 204) {
    return null
  }
  const corpo = await lerJson(resposta)
  if (resposta.ok) {
    return corpo
  }
  throw new ApiError({
    status: resposta.status,
    code: corpo?.code ?? (resposta.status >= 500 ? 'INTERNAL_ERROR' : 'UNEXPECTED_ERROR'),
    detail: corpo?.detail,
    errors: Array.isArray(corpo?.errors) ? corpo.errors : [],
    retryAfterSegundos: lerRetryAfter(resposta.headers.get('Retry-After')),
  })
}

async function lerJson(resposta) {
  const tipo = resposta.headers.get('Content-Type') ?? ''
  if (!tipo.includes('json')) {
    return null
  }
  try {
    return await resposta.json()
  } catch {
    return null
  }
}

function lerRetryAfter(valor) {
  const segundos = Number.parseInt(valor ?? '', 10)
  return Number.isFinite(segundos) && segundos > 0 ? segundos : null
}
