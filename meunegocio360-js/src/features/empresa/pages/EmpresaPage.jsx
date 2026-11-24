import { useState } from 'react'
import { Alert, Button, Card } from 'react-bootstrap'
import { useLocation } from 'react-router'
import { ACCESS_PROFILES } from '../../../shared/lib/accessProfiles.js'
import {
  formatStoredCnpj,
  formatStoredPhone,
} from '../../../shared/lib/companyFormatting.js'
import { ApiError } from '../../../shared/lib/http.js'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal.jsx'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'
import { useAuth } from '../../auth'
import EmpresaForm from '../components/EmpresaForm.jsx'
import { useEmpresa } from '../hooks/useEmpresaContext.js'
import { useEmpresaActions } from '../hooks/useEmpresaActions.js'

function statusError(error) {
  if (error instanceof ApiError && error.code === 'COMPANY_ALREADY_ACTIVE') {
    return 'Já existe uma empresa ativa. Inative-a antes de reativar outra.'
  }
  if (error instanceof ApiError && error.code === 'VERSION_CONFLICT') {
    return 'Os dados da empresa foram alterados. Recarregue os dados antes de tentar novamente.'
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'Você não tem permissão para alterar os dados da empresa.'
  }
  return 'Não foi possível alterar a situação da empresa. Verifique sua conexão e tente novamente.'
}

function EmpresaPage() {
  const { empresa, retry } = useEmpresa()
  const { user } = useAuth()
  const location = useLocation()
  const actions = useEmpresaActions()
  const [editing, setEditing] = useState(false)
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false)
  const [statusAlert, setStatusAlert] = useState(null)
  const [modalError, setModalError] = useState(null)
  const [reloadModalData, setReloadModalData] = useState(false)
  const isAdministrator = user?.perfil === ACCESS_PROFILES.ADMIN

  const saveChanges = async (data) => {
    await actions.atualizar({
      ...data,
      id: empresa.id,
      versao: empresa.versao,
    })
    setEditing(false)
    setStatusAlert('Dados da empresa atualizados.')
  }

  const reloadLatestCompany = async () => {
    const result = await retry()
    if (result.isError || !result.data) {
      throw result.error || new Error('Empresa indisponível.')
    }
    return result.data
  }

  const changeStatus = async (ativa) => {
    setModalError(null)
    setReloadModalData(false)
    try {
      await actions.alterarSituacao({
        id: empresa.id,
        ativa,
        versao: empresa.versao,
      })
      setConfirmingDeactivation(false)
      setStatusAlert(
        ativa
          ? 'Empresa reativada com sucesso.'
          : 'Empresa inativada com sucesso.',
      )
    } catch (error) {
      setModalError(statusError(error))
      setReloadModalData(
        error instanceof ApiError && error.code === 'VERSION_CONFLICT',
      )
    }
  }

  const reloadSituationData = async () => {
    if (reloadModalData) {
      try {
        await reloadLatestCompany()
        setModalError(null)
        setReloadModalData(false)
        return
      } catch {
        setModalError('Não foi possível recarregar os dados da empresa.')
        return
      }
    }
    await changeStatus(false)
  }

  return (
    <main className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
            <h1 className="h2 mb-0">Empresa</h1>
            {isAdministrator && !editing && (
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button
                  type="button"
                  variant="outline-dark"
                  onClick={() => setEditing(true)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline-dark"
                  onClick={() => setConfirmingDeactivation(true)}
                >
                  Inativar
                </Button>
              </div>
            )}
          </div>

          {statusAlert && (
            <Alert variant="success" role="status" aria-live="polite">
              {statusAlert}
            </Alert>
          )}
          {location.state?.companyReactivated && (
            <Alert variant="success" role="status" aria-live="polite">
              Empresa reativada com sucesso.
            </Alert>
          )}

          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              {editing ? (
                <>
                  <h2 className="h3 mb-4">Editar dados da empresa</h2>
                  <EmpresaForm
                    key={`${empresa.id}-${empresa.versao}`}
                    empresa={empresa}
                    submitLabel="Salvar alterações"
                    pending={actions.carregando}
                    onSubmit={saveChanges}
                    onCancel={() => setEditing(false)}
                    onReload={reloadLatestCompany}
                  />
                </>
              ) : (
                <dl className="row mb-0">
                  <div className="col-12 col-md-6 mb-3">
                    <dt>Razão social</dt>
                    <dd>{empresa.razaoSocial}</dd>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <dt>Nome fantasia</dt>
                    <dd>{empresa.nomeFantasia || '—'}</dd>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <dt>CNPJ</dt>
                    <dd>{formatStoredCnpj(empresa.cnpj)}</dd>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <dt>E-mail</dt>
                    <dd>{empresa.email || '—'}</dd>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <dt>Telefone</dt>
                    <dd>{formatStoredPhone(empresa.telefone)}</dd>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <dt>Fuso horário</dt>
                    <dd>{empresa.fusoHorario}</dd>
                  </div>
                  <div className="col-12 col-md-6">
                    <dt>Moeda</dt>
                    <dd>{empresa.moeda}</dd>
                  </div>
                </dl>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <ConfirmModal
        show={confirmingDeactivation}
        title="Inativar empresa"
        confirmLabel="Inativar"
        confirming={actions.carregando}
        onCancel={() => setConfirmingDeactivation(false)}
        onConfirm={() => changeStatus(false)}
      >
        {modalError && (
          <ErrorAlert
            onRetry={reloadSituationData}
            retryLabel={
              reloadModalData ? 'Recarregar dados' : 'Tentar novamente'
            }
          >
            {modalError}
          </ErrorAlert>
        )}
        <p>
          Ao inativar a empresa, não será possível cadastrar clientes,
          fornecedores, produtos nem vendas até que uma empresa seja ativada.
        </p>
      </ConfirmModal>
    </main>
  )
}

export default EmpresaPage
