import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  changeCompanyStatus,
  createCompany,
  empresaQueryKeys,
  updateCompany,
} from '../api/empresaApi.js'

export function useEmpresaActions() {
  const queryClient = useQueryClient()

  const syncCompany = (empresa) => {
    queryClient.setQueryData(
      empresaQueryKeys.active,
      empresa.ativa ? empresa : null,
    )
    queryClient.invalidateQueries({ queryKey: ['empresa', 'inativas'] })
  }

  const create = useMutation({
    mutationFn: createCompany,
    onSuccess: syncCompany,
  })
  const update = useMutation({
    mutationFn: updateCompany,
    onSuccess: syncCompany,
  })
  const changeStatus = useMutation({
    mutationFn: changeCompanyStatus,
    onSuccess: syncCompany,
  })

  return {
    cadastrar: create.mutateAsync,
    atualizar: update.mutateAsync,
    alterarSituacao: changeStatus.mutateAsync,
    carregando: create.isPending || update.isPending || changeStatus.isPending,
  }
}
