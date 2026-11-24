import { ApiError, apiRequest } from '../../../shared/lib/http.js'

export const empresaQueryKeys = {
  active: ['empresa', 'ativa'],
  inactive: (page, size) => ['empresa', 'inativas', page, size],
}

export async function getActiveCompany() {
  try {
    return await apiRequest('/empresa')
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404 &&
      error.code === 'COMPANY_NOT_REGISTERED'
    ) {
      return null
    }

    throw error
  }
}

export function getInactiveCompanies({ page = 0, size = 20 } = {}) {
  return apiRequest(`/empresa/inativas?page=${page}&size=${size}`)
}

export function createCompany(data) {
  return apiRequest('/empresa', { method: 'POST', body: data })
}

export function updateCompany({ id, ...data }) {
  return apiRequest(`/empresa/${id}`, { method: 'PUT', body: data })
}

export function changeCompanyStatus({ id, ativa, versao }) {
  return apiRequest(`/empresa/${id}/situacao`, {
    method: 'PATCH',
    body: { ativa, versao },
  })
}
