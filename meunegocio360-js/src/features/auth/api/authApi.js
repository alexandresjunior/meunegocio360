// Chamadas HTTP da autenticação (RNF-FE-03), conforme o contrato do RF-BE-001.
import { requisicao } from '../../../shared/lib/http.js'

// Rotas de autenticação nunca entram no fluxo "renovar e repetir" (RNF-FE-11).
const ROTA_PUBLICA = { autenticar: false, renovarEm401: false }

/** POST /auth/login → { tokenType, accessToken, expiresIn, usuario } */
export function login({ email, senha }) {
  return requisicao('/auth/login', {
    ...ROTA_PUBLICA,
    method: 'POST',
    body: { email, senha },
  })
}

/** POST /auth/refresh: usa o cookie HttpOnly enviado pelo navegador. */
export function refresh() {
  return requisicao('/auth/refresh', { ...ROTA_PUBLICA, method: 'POST' })
}

/** POST /auth/logout → 204 (idempotente). */
export function logout() {
  return requisicao('/auth/logout', { ...ROTA_PUBLICA, method: 'POST' })
}

/** GET /auth/me → { id, nome, email, perfil } (rota autenticada). */
export function me({ signal } = {}) {
  return requisicao('/auth/me', { signal })
}
