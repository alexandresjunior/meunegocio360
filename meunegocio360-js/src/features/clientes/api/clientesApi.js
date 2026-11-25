import { apiRequest } from '../../../shared/lib/http.js'

export const clientesQueryKeys = {
  lists: ['clientes', 'lista'],
  list: ({ q, situacao, page, size }) => [
    ...clientesQueryKeys.lists,
    q,
    situacao,
    page,
    size,
  ],
  detail: (id) => ['clientes', 'detalhe', id],
}

export function listClientes({
  q = '',
  situacao = 'ATIVO',
  page = 0,
  size = 20,
  signal,
} = {}) {
  const params = new URLSearchParams({
    q,
    situacao,
    page: String(page),
    size: String(size),
    sort: 'nome',
  })

  return apiRequest(`/clientes?${params}`, { signal })
}

export function getCliente(id, signal) {
  return apiRequest(`/clientes/${id}`, { signal })
}

export function createCliente(data) {
  return apiRequest('/clientes', { method: 'POST', body: data })
}

export function updateCliente({ id, ...data }) {
  return apiRequest(`/clientes/${id}`, { method: 'PUT', body: data })
}

export function changeClienteStatus({ id, ativo, versao }) {
  return apiRequest(`/clientes/${id}/situacao`, {
    method: 'PATCH',
    body: { ativo, versao },
  })
}

export function deleteCliente(id) {
  return apiRequest(`/clientes/${id}`, { method: 'DELETE' })
}
