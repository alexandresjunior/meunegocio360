import { ApiError, request } from '../../../shared/lib/http'
import { sessaoSchema } from '../schemas'

// Os endpoints /auth/* nunca entram no fluxo "renovar e repetir" (auth: false).

export async function login({ email, senha }) {
  const corpo = await request('/auth/login', {
    method: 'POST',
    body: { email, senha },
    auth: false,
  })
  return validarSessao(corpo)
}

let renovacaoEmAndamento = null

/**
 * Renova a sessão pelo cookie HttpOnly. Chamadas simultâneas compartilham a mesma requisição
 * (single-flight, RNF-FE-15): o refresh token é rotativo e dois usos derrubariam a sessão.
 */
export function refresh() {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = request('/auth/refresh', { method: 'POST', auth: false })
      .then(validarSessao)
      .finally(() => {
        renovacaoEmAndamento = null
      })
  }
  return renovacaoEmAndamento
}

export function logout() {
  return request('/auth/logout', { method: 'POST', auth: false })
}

function validarSessao(corpo) {
  const resultado = sessaoSchema.safeParse(corpo)
  if (!resultado.success) {
    throw new ApiError({
      status: 0,
      code: 'INVALID_RESPONSE',
      detail: 'Resposta inesperada do servidor.',
    })
  }
  return resultado.data
}
