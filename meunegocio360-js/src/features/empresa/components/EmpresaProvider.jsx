import { useCallback, useMemo } from 'react'
import { useActiveEmpresaQuery } from '../hooks/useEmpresa.js'
import { EmpresaContext } from './EmpresaContext.js'

export function EmpresaProvider({ children }) {
  const { data, error, isPending, isError, refetch } = useActiveEmpresaQuery()
  const status = isPending
    ? 'carregando'
    : isError
      ? 'erro'
      : data
        ? 'ativa'
        : 'ausente'
  const retry = useCallback(() => refetch(), [refetch])
  const value = useMemo(
    () => ({
      status,
      empresa: data || null,
      erro: error || null,
      retry,
    }),
    [data, error, retry, status],
  )

  return (
    <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>
  )
}
