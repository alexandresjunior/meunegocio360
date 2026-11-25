import { useEffect } from 'react'
import { Alert, Card, Spinner } from 'react-bootstrap'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router'
import { ApiError } from '../../../shared/lib/http.js'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'
import ClienteForm from '../components/ClienteForm.jsx'
import { useCliente, useClienteActions } from '../hooks/useClientes.js'

function ClienteFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const clienteQuery = useCliente(id)
  const actions = useClienteActions()
  const editing = Boolean(id)

  useEffect(() => {
    document.title = `${editing ? 'Editar' : 'Novo'} cliente | MeuNegocio360`
  }, [editing])

  if (editing && clienteQuery.isPending) {
    return (
      <main className="container py-5" role="status" aria-live="polite">
        <Spinner size="sm" animation="border" aria-hidden="true" /> Carregando
        cliente...
      </main>
    )
  }

  if (
    editing &&
    clienteQuery.error instanceof ApiError &&
    clienteQuery.error.status === 403 &&
    clienteQuery.error.code === 'ACCESS_DENIED'
  ) {
    return <Navigate to="/acesso-negado" replace />
  }

  if (
    editing &&
    clienteQuery.error instanceof ApiError &&
    clienteQuery.error.status === 404 &&
    clienteQuery.error.code === 'CUSTOMER_NOT_FOUND'
  ) {
    return (
      <main className="container py-5">
        <h1 className="h2">Cliente não encontrado</h1>
        <p>Este cliente não existe ou não pertence à empresa ativa.</p>
        <Link className="btn btn-primary" to="/clientes">
          Voltar para clientes
        </Link>
      </main>
    )
  }

  if (editing && clienteQuery.isError) {
    return (
      <main className="container py-5">
        <ErrorAlert onRetry={() => clienteQuery.refetch()}>
          Não foi possível carregar os dados do cliente.
        </ErrorAlert>
        <Link className="btn btn-outline-dark" to="/clientes">
          Voltar para clientes
        </Link>
      </main>
    )
  }

  const cliente = editing ? clienteQuery.data : null

  const save = async (data) => {
    const savedCliente = editing
      ? await actions.atualizar({
          ...data,
          id: cliente.id,
          versao: cliente.versao,
        })
      : await actions.cadastrar(data)
    const params = new URLSearchParams({
      q: savedCliente.nome,
      situacao: savedCliente.ativo ? 'ATIVO' : 'INATIVO',
      page: '0',
    })
    navigate(`/clientes?${params}`, {
      replace: true,
      state: {
        clienteFeedback: editing
          ? 'Cliente atualizado com sucesso.'
          : 'Cliente cadastrado com sucesso.',
      },
    })
  }

  const reload = async () => {
    const result = await clienteQuery.refetch()
    if (result.isError || !result.data) {
      throw result.error || new Error('Cliente indisponível.')
    }
    return result.data
  }

  return (
    <main className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <h1 className="h2 mb-2">
                {editing ? 'Editar cliente' : 'Novo cliente'}
              </h1>
              <p className="text-body-secondary mb-4">
                Informe os dados de identificação e contato.
              </p>
              <ClienteForm
                key={editing ? `${cliente.id}-${cliente.versao}` : 'novo'}
                cliente={cliente}
                submitLabel={
                  editing ? 'Salvar alterações' : 'Cadastrar cliente'
                }
                pending={actions.carregando}
                onSubmit={save}
                onCancel={() =>
                  navigate(`/clientes${location.search}`, { replace: true })
                }
                onReload={editing ? reload : undefined}
              />
            </Card.Body>
          </Card>
          {location.state?.clienteFeedback && (
            <Alert variant="success" className="mt-3" role="status">
              {location.state.clienteFeedback}
            </Alert>
          )}
        </div>
      </div>
    </main>
  )
}

export default ClienteFormPage
