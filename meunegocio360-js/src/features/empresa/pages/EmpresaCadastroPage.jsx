import { ApiError } from '../../../shared/lib/http.js'
import { Button, Card, Pagination, Spinner } from 'react-bootstrap'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import EmpresaForm from '../components/EmpresaForm.jsx'
import { useEmpresaActions } from '../hooks/useEmpresaActions.js'
import { useInactiveEmpresasQuery } from '../hooks/useEmpresa.js'
import { formatStoredCnpj } from '../../../shared/lib/companyFormatting.js'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'

const PAGE_SIZE = 10

function inactiveActionError(error) {
  if (error instanceof ApiError && error.code === 'COMPANY_ALREADY_ACTIVE') {
    return {
      message:
        'Já existe uma empresa ativa. Inative-a antes de reativar outra.',
    }
  }
  if (error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
    return {
      message:
        'Os dados da empresa foram alterados. Atualize a lista antes de tentar novamente.',
      reload: true,
    }
  }
  if (error instanceof ApiError && error.status === 403) {
    return {
      message: 'Você não tem permissão para alterar os dados da empresa.',
    }
  }
  return {
    message:
      'Não foi possível reativar a empresa. Verifique sua conexão e tente novamente.',
    retry: true,
  }
}

function EmpresaCadastroPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [actionError, setActionError] = useState(null)
  const [retryCompany, setRetryCompany] = useState(null)
  const [reloadInactiveList, setReloadInactiveList] = useState(false)
  const actions = useEmpresaActions()
  const inactiveQuery = useInactiveEmpresasQuery(page, PAGE_SIZE)

  const submitNewCompany = async (data) => {
    await actions.cadastrar(data)
    navigate('/', { replace: true, state: { companyCreated: true } })
  }

  const reloadInactiveCompanies = async () => {
    const result = await inactiveQuery.refetch()
    if (!result.isError) {
      setActionError(null)
      setRetryCompany(null)
      setReloadInactiveList(false)
    }
  }

  const reactivate = async (company) => {
    setActionError(null)
    setRetryCompany(null)
    setReloadInactiveList(false)
    try {
      await actions.alterarSituacao({
        id: company.id,
        ativa: true,
        versao: company.versao,
      })
      navigate('/empresa', {
        replace: true,
        state: { companyReactivated: true },
      })
    } catch (error) {
      const failure = inactiveActionError(error)
      setActionError(failure)
      setRetryCompany(company)
      setReloadInactiveList(Boolean(failure.reload))
    }
  }

  return (
    <main className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9 col-xl-8">
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h1 className="h2 mb-2">Cadastre sua empresa</h1>
              <p className="text-body-secondary mb-4">
                Informe os dados da empresa para liberar o acesso aos módulos.
              </p>
              <EmpresaForm
                submitLabel="Cadastrar empresa"
                pending={actions.carregando}
                onSubmit={submitNewCompany}
              />
            </Card.Body>
          </Card>

          <section className="mt-4" aria-labelledby="inactive-company-title">
            <h2 id="inactive-company-title" className="h3 mb-3">
              Empresas inativas
            </h2>
            {actionError && (
              <ErrorAlert
                onRetry={
                  reloadInactiveList
                    ? reloadInactiveCompanies
                    : actionError.retry
                      ? () => reactivate(retryCompany)
                      : undefined
                }
                retryLabel={
                  reloadInactiveList ? 'Recarregar dados' : 'Tentar novamente'
                }
              >
                {actionError.message}
              </ErrorAlert>
            )}

            {inactiveQuery.isPending && (
              <div className="py-3" role="status" aria-live="polite">
                <Spinner size="sm" animation="border" aria-hidden="true" />{' '}
                Carregando empresas inativas...
              </div>
            )}

            {inactiveQuery.isError && (
              <ErrorAlert onRetry={() => inactiveQuery.refetch()}>
                Não foi possível carregar as empresas inativas.
              </ErrorAlert>
            )}

            {inactiveQuery.isSuccess &&
              (inactiveQuery.data.content.length === 0 ? (
                <p>Nenhuma empresa inativa disponível para reativação.</p>
              ) : (
                <>
                  <div className="d-flex flex-column gap-3">
                    {inactiveQuery.data.content.map((company) => (
                      <Card key={company.id} className="shadow-sm">
                        <Card.Body className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                          <div>
                            <h3 className="h5 mb-1">
                              {company.nomeFantasia || company.razaoSocial}
                            </h3>
                            <p className="mb-0">
                              <span className="fw-semibold">CNPJ:</span>{' '}
                              {formatStoredCnpj(company.cnpj)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => reactivate(company)}
                            disabled={actions.carregando}
                          >
                            {actions.carregando ? 'Reativando...' : 'Reativar'}
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>

                  {inactiveQuery.data.totalPages > 1 && (
                    <nav
                      className="mt-3"
                      aria-label="Paginação das empresas inativas"
                    >
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          disabled={page === 0}
                          onClick={() => setPage((current) => current - 1)}
                          aria-label="Página anterior"
                        />
                        <Pagination.Item active>
                          {page + 1} de {inactiveQuery.data.totalPages}
                        </Pagination.Item>
                        <Pagination.Next
                          disabled={page + 1 >= inactiveQuery.data.totalPages}
                          onClick={() => setPage((current) => current + 1)}
                          aria-label="Próxima página"
                        />
                      </Pagination>
                    </nav>
                  )}
                </>
              ))}
          </section>
        </div>
      </div>
    </main>
  )
}

export default EmpresaCadastroPage
