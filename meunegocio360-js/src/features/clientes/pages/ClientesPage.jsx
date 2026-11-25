import { useEffect, useState } from 'react'
import { Alert, Button, Card, Spinner, Table } from 'react-bootstrap'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import {
  formatDocument,
  formatStoredPhone,
} from '../../../shared/lib/companyFormatting.js'
import { ApiError } from '../../../shared/lib/http.js'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'
import { ListToolbar } from '../../../shared/ui/ListToolbar.jsx'
import { Paginacao } from '../../../shared/ui/Paginacao.jsx'
import { StatusBadge } from '../../../shared/ui/StatusBadge.jsx'
import { useUrlFilters } from '../../../shared/lib/useUrlFilters.js'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal.jsx'
import { useBuscaClientes, useClienteActions } from '../hooks/useClientes.js'

const PAGE_SIZE = 20

function ClientesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const filters = useUrlFilters()
  const { page: currentPage, setPage } = filters
  const clientesQuery = useBuscaClientes(filters.appliedQuery, {
    situacao: filters.situation,
    page: currentPage,
    size: PAGE_SIZE,
  })
  const actions = useClienteActions()
  const [dialog, setDialog] = useState(null)
  const [alertMessage, setAlertMessage] = useState(
    location.state?.clienteFeedback || null,
  )

  useEffect(() => {
    document.title = 'Clientes | MeuNegocio360'
  }, [])

  useEffect(() => {
    const data = clientesQuery.data
    if (
      data &&
      currentPage > 0 &&
      (data.totalPages === 0 || currentPage >= data.totalPages)
    ) {
      setPage(Math.max(0, data.totalPages - 1))
    }
  }, [clientesQuery.data, currentPage, setPage])

  const openStatusDialog = (cliente) => {
    setDialog({
      type: 'status',
      cliente,
      active: !cliente.ativo,
      message: null,
    })
  }

  const openDeleteDialog = (cliente) => {
    setDialog({ type: 'delete', cliente, historyBlocked: false, message: null })
  }

  const submitDialog = async () => {
    if (!dialog) {
      return
    }

    const currentDialog = dialog
    const { cliente } = currentDialog
    setAlertMessage(null)
    try {
      if (currentDialog.type === 'delete' && !currentDialog.historyBlocked) {
        await actions.excluir(cliente.id)
        setAlertMessage('Cliente excluído.')
      } else {
        const active =
          currentDialog.type === 'delete' ? false : currentDialog.active
        await actions.alterarSituacao({
          id: cliente.id,
          ativo: active,
          versao: cliente.versao,
        })
        setAlertMessage(active ? 'Cliente reativado.' : 'Cliente inativado.')
      }
      setDialog(null)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 422 &&
        error.code === 'CUSTOMER_HAS_HISTORY'
      ) {
        setDialog({
          ...currentDialog,
          historyBlocked: true,
          message:
            'Este cliente possui vendas ou ordens de serviço vinculadas e não pode ser excluído. Você pode inativá-lo.',
        })
        return
      }

      if (
        currentDialog.type === 'delete' &&
        error instanceof ApiError &&
        error.status === 404 &&
        error.code === 'CUSTOMER_NOT_FOUND'
      ) {
        setDialog(null)
        setAlertMessage('Este cliente não existe mais.')
        await clientesQuery.refetch()
        return
      }

      if (
        error instanceof ApiError &&
        error.status === 403 &&
        error.code === 'ACCESS_DENIED'
      ) {
        navigate('/acesso-negado', { replace: true })
        return
      }

      const versionConflict =
        error instanceof ApiError &&
        error.status === 409 &&
        error.code === 'VERSION_CONFLICT'
      const message = versionConflict
        ? 'Os dados do cliente foram alterados. Recarregue a lista antes de tentar novamente.'
        : error instanceof ApiError &&
            error.status === 422 &&
            error.code === 'COMPANY_NOT_ACTIVE'
          ? 'Cadastre ou ative a empresa para continuar.'
          : 'Não foi possível concluir a ação. Verifique sua conexão e tente novamente.'
      setDialog({ ...currentDialog, message, reload: versionConflict })
    }
  }

  const reloadList = async () => {
    const result = await clientesQuery.refetch()
    if (result.isError) {
      setDialog((current) =>
        current
          ? {
              ...current,
              message:
                'Não foi possível atualizar a lista. Tente recarregar novamente.',
            }
          : current,
      )
      return
    }

    setDialog(null)
  }

  if (
    clientesQuery.error instanceof ApiError &&
    clientesQuery.error.status === 403 &&
    clientesQuery.error.code === 'ACCESS_DENIED'
  ) {
    return <Navigate to="/acesso-negado" replace />
  }

  const clientes = clientesQuery.data?.content || []
  const isEmpty = clientesQuery.isSuccess && clientes.length === 0
  const hasActiveFilters = filters.hasFilters
  const dialogTitle =
    dialog?.type === 'delete'
      ? 'Excluir cliente'
      : dialog?.active
        ? 'Reativar cliente'
        : 'Inativar cliente'
  const dialogConfirmLabel = dialog?.historyBlocked
    ? 'Inativar cliente'
    : dialog?.type === 'delete'
      ? 'Excluir'
      : dialog?.active
        ? 'Reativar'
        : 'Inativar'

  return (
    <main className="container py-4 py-md-5">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <h1 className="h2 mb-0">Clientes</h1>
        <Button
          as={Link}
          to={`/clientes/novo${location.search}`}
          variant="primary"
        >
          Novo cliente
        </Button>
      </div>

      {alertMessage && (
        <Alert variant="success" role="status" aria-live="polite">
          {alertMessage}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body className="p-3 p-md-4">
          <ListToolbar
            query={filters.query}
            onQueryChange={filters.setQuery}
            situation={filters.situation}
            onSituationChange={filters.setSituation}
          />

          {clientesQuery.isPending && (
            <div className="py-3" role="status" aria-live="polite">
              <Spinner size="sm" animation="border" aria-hidden="true" />{' '}
              Carregando clientes...
            </div>
          )}

          {clientesQuery.isError && (
            <ErrorAlert onRetry={() => clientesQuery.refetch()}>
              Não foi possível carregar os clientes.
            </ErrorAlert>
          )}

          {isEmpty &&
            (hasActiveFilters ? (
              <div className="py-3">
                <p>Nenhum cliente encontrado para a busca.</p>
                <Button
                  type="button"
                  variant="outline-dark"
                  onClick={filters.clearFilters}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <p className="py-3 mb-0">
                Nenhum cliente cadastrado. Cadastre o primeiro cliente.
              </p>
            ))}

          {clientesQuery.isSuccess && clientes.length > 0 && (
            <>
              <Table responsive hover className="align-middle">
                <caption className="visually-hidden">
                  Clientes cadastrados
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Documento</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Situação</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <th scope="row">{cliente.nome}</th>
                      <td>
                        {formatDocument(cliente.documento, cliente.tipoPessoa)}
                      </td>
                      <td>{formatStoredPhone(cliente.telefone)}</td>
                      <td>{cliente.email || '—'}</td>
                      <td>
                        <StatusBadge active={cliente.ativo} />
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <Button
                            as={Link}
                            to={`/clientes/${cliente.id}${location.search}`}
                            size="sm"
                            variant="outline-dark"
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-dark"
                            onClick={() => openStatusDialog(cliente)}
                          >
                            {cliente.ativo ? 'Inativar' : 'Reativar'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-danger"
                            onClick={() => openDeleteDialog(cliente)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                <p className="mb-0">
                  {clientesQuery.data.totalElements} clientes encontrados
                </p>
                <Paginacao
                  page={clientesQuery.data.page}
                  totalPages={clientesQuery.data.totalPages}
                  onPageChange={filters.setPage}
                  label="Paginação de clientes"
                />
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {dialog && (
        <ConfirmModal
          show
          title={dialogTitle}
          confirmLabel={dialogConfirmLabel}
          confirming={actions.carregando}
          onCancel={() => setDialog(null)}
          onConfirm={submitDialog}
        >
          {dialog.message && (
            <ErrorAlert
              onRetry={
                dialog.historyBlocked
                  ? undefined
                  : dialog.reload
                    ? reloadList
                    : submitDialog
              }
              retryLabel={dialog.reload ? 'Recarregar dados' : undefined}
            >
              {dialog.message}
            </ErrorAlert>
          )}
          {dialog.type === 'delete' && (
            <p>
              Excluir o cliente <strong>{dialog.cliente.nome}</strong>? Esta
              ação não pode ser desfeita.
            </p>
          )}
          {dialog.type === 'status' && (
            <p>
              {dialog.active
                ? `Reativar ${dialog.cliente.nome}?`
                : `Inativar ${dialog.cliente.nome}?`}
            </p>
          )}
        </ConfirmModal>
      )}
    </main>
  )
}

export default ClientesPage
