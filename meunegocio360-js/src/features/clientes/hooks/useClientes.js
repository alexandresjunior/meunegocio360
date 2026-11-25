import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeClienteStatus,
  clientesQueryKeys,
  createCliente,
  deleteCliente,
  getCliente,
  listClientes,
  updateCliente,
} from '../api/clientesApi.js'

export function useBuscaClientes(
  q,
  { situacao = 'ATIVO', page = 0, size = 20, enabled = true } = {},
) {
  const params = { q: q.trim(), situacao, page, size }

  return useQuery({
    queryKey: clientesQueryKeys.list(params),
    queryFn: ({ signal }) => listClientes({ ...params, signal }),
    enabled,
  })
}

export function useCliente(id) {
  return useQuery({
    queryKey: clientesQueryKeys.detail(id),
    queryFn: ({ signal }) => getCliente(id, signal),
    enabled: Boolean(id),
  })
}

export function useClienteActions() {
  const queryClient = useQueryClient()
  const invalidateLists = () =>
    queryClient.invalidateQueries({ queryKey: clientesQueryKeys.lists })

  const create = useMutation({
    mutationFn: createCliente,
    onSuccess: invalidateLists,
  })
  const update = useMutation({
    mutationFn: updateCliente,
    onSuccess: (cliente) => {
      queryClient.setQueryData(clientesQueryKeys.detail(cliente.id), cliente)
      return invalidateLists()
    },
  })
  const changeStatus = useMutation({
    mutationFn: changeClienteStatus,
    onSuccess: (cliente) => {
      queryClient.setQueryData(clientesQueryKeys.detail(cliente.id), cliente)
      return invalidateLists()
    },
  })
  const remove = useMutation({
    mutationFn: deleteCliente,
    onSuccess: invalidateLists,
  })

  return {
    cadastrar: create.mutateAsync,
    atualizar: update.mutateAsync,
    alterarSituacao: changeStatus.mutateAsync,
    excluir: remove.mutateAsync,
    carregando:
      create.isPending ||
      update.isPending ||
      changeStatus.isPending ||
      remove.isPending,
  }
}
