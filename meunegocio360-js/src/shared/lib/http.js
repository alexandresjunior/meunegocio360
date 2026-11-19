// Cliente HTTP único da aplicação (RNF-FE-10, RNF-FE-11, RNF-FE-14, RNF-FE-15).
//
// - URL base relativa, lida de VITE_API_BASE_URL (RNF-103).
// - Injeta Authorization: Bearer e X-Request-Id; aplica timeout com AbortController.
// - Converte application/problem+json em ApiError.
// - Diante de 401, faz UMA renovação de sessão (agrupada entre chamadas simultâneas)
//   e repete a requisição; se a renovação falhar com 401, encerra a sessão.
//
// Este módulo não conhece a feature de autenticação (RNF-FE-01): o AuthProvider
// registra, via configurarSessao, como obter o token, como renovar e o que fazer
// quando a sessão expira.

const URL_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const TIMEOUT_MS = 15_000

export class ApiError extends Error {
  /**
   * @param {object} dados
   * @param {number} dados.status  código HTTP (0 = falha de rede ou timeout)
   * @param {string} dados.code    código estável do erro (decisões usam este campo)
   * @param {string} [dados.detail]
   * @param {Array<{field: string, message: string}>} [dados.errors]
   * @param {number|null} [dados.retryAfter]  segundos indicados em Retry-After
   */
  constructor({ status, code, detail = '', errors = [], retryAfter = null }) {
    super(code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
    this.errors = errors
    this.retryAfter = retryAfter
  }
}

let sessao = {
  obterToken: () => null,
  renovar: null,
  aoExpirar: () => {},
}

/**
 * Registra as funções de sessão fornecidas pelo provedor de autenticação.
 * Devolve uma função que desfaz o registro.
 */
export function configurarSessao(config) {
  const anterior = sessao
  sessao = { ...sessao, ...config }
  return () => {
    sessao = anterior
  }
}

let renovacaoEmAndamento = null

/**
 * Renova a sessão uma única vez por vez (single-flight, RNF-FE-15): chamadas
 * simultâneas recebem a mesma promessa. O refresh token é rotativo, e duas
 * renovações paralelas com o mesmo cookie derrubariam a sessão no backend.
 * Também evita a renovação duplicada da montagem dupla do StrictMode.
 *
 * @returns {Promise<string>} o novo token de acesso
 */
export function renovarSessao() {
  if (!sessao.renovar) {
    return Promise.reject(new ApiError({ status: 401, code: 'NO_SESSION' }))
  }
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = Promise.resolve()
      .then(() => sessao.renovar())
      .finally(() => {
        renovacaoEmAndamento = null
      })
  }
  return renovacaoEmAndamento
}

async function executar(caminho, { method, body, signal, token }) {
  const headers = {
    Accept: 'application/json, application/problem+json',
    'X-Request-Id': crypto.randomUUID(),
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const controle = new AbortController()
  let estourouTempo = false
  const temporizador = setTimeout(() => {
    estourouTempo = true
    controle.abort()
  }, TIMEOUT_MS)
  const cancelarExterno = () => controle.abort()
  signal?.addEventListener('abort', cancelarExterno)

  try {
    return await fetch(`${URL_BASE}${caminho}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // Mesma origem: o navegador envia o cookie HttpOnly de refresh (RNF-FE-10).
      credentials: 'same-origin',
      signal: controle.signal,
    })
  } catch (erro) {
    if (estourouTempo) throw new ApiError({ status: 0, code: 'TIMEOUT' })
    if (signal?.aborted) throw erro // cancelamento pedido por quem chamou
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR' })
  } finally {
    clearTimeout(temporizador)
    signal?.removeEventListener('abort', cancelarExterno)
  }
}

function lerRetryAfter(resposta) {
  const valor = Number.parseInt(resposta.headers.get('Retry-After') ?? '', 10)
  return Number.isFinite(valor) && valor >= 0 ? valor : null
}

async function interpretar(resposta) {
  const tipo = resposta.headers.get('Content-Type') ?? ''
  const ehJson = tipo.includes('json')

  if (resposta.ok) {
    if (resposta.status === 204 || !ehJson) return null
    return resposta.json()
  }

  let problema = {}
  if (ehJson) {
    try {
      problema = await resposta.json()
    } catch {
      problema = {}
    }
  }
  throw new ApiError({
    status: resposta.status,
    code: typeof problema.code === 'string' ? problema.code : 'HTTP_ERROR',
    detail: typeof problema.detail === 'string' ? problema.detail : '',
    errors: Array.isArray(problema.errors) ? problema.errors : [],
    retryAfter: lerRetryAfter(resposta),
  })
}

/**
 * Faz uma requisição à API.
 *
 * @param {string} caminho  caminho relativo à URL base (ex.: "/auth/me")
 * @param {object} [opcoes]
 * @param {string} [opcoes.method="GET"]
 * @param {unknown} [opcoes.body]  serializado como JSON
 * @param {AbortSignal} [opcoes.signal]
 * @param {boolean} [opcoes.autenticar=true]  envia o token de acesso
 * @param {boolean} [opcoes.renovarEm401=true]  renova e repete diante de 401.
 *   Rotas de autenticação (login, refresh, logout) usam false: o refresh nunca
 *   pode disparar outra renovação (evita laço infinito).
 */
export async function requisicao(
  caminho,
  { method = 'GET', body, signal, autenticar = true, renovarEm401 = true } = {},
) {
  const token = autenticar ? sessao.obterToken() : null
  let resposta = await executar(caminho, { method, body, signal, token })

  if (resposta.status === 401 && renovarEm401) {
    let novoToken
    try {
      novoToken = await renovarSessao()
    } catch (erro) {
      // Só um 401 na renovação encerra a sessão; falha de rede não (RF-FE-001).
      if (erro instanceof ApiError && erro.status === 401) sessao.aoExpirar()
      throw erro
    }
    resposta = await executar(caminho, {
      method,
      body,
      signal,
      token: novoToken,
    })
  }

  return interpretar(resposta)
}
