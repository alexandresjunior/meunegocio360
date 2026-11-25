import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import {
  formatDocument,
  formatPhone,
  onlyDigits,
} from '../../../shared/lib/companyFormatting.js'
import { ApiError } from '../../../shared/lib/http.js'
import { DocumentoInput } from '../../../shared/ui/DocumentoInput.jsx'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'
import { clienteSchema } from '../schemas.js'

function toFormValues(cliente) {
  const tipoPessoa = cliente?.tipoPessoa || 'FISICA'
  return {
    tipoPessoa,
    nome: cliente?.nome || '',
    documento: formatDocument(cliente?.documento || '', tipoPessoa),
    email: cliente?.email || '',
    telefone: formatPhone(cliente?.telefone || ''),
  }
}

function resolveApiError(error) {
  if (!(error instanceof ApiError)) {
    throw error
  }

  if (error.status === 409 && error.code === 'CUSTOMER_DOCUMENT_DUPLICATE') {
    return {
      fieldErrors: [
        {
          field: 'documento',
          message:
            'Já existe um cliente com este documento. Ele pode estar inativo; busque por ele e reative.',
        },
      ],
    }
  }

  if (error.status === 409 && error.code === 'VERSION_CONFLICT') {
    return {
      message: 'Os dados do cliente foram alterados por outra operação.',
      reload: true,
    }
  }

  if (error.status === 422 && error.code === 'COMPANY_NOT_ACTIVE') {
    return { companyInactive: true }
  }

  if (error.status === 403 && error.code === 'ACCESS_DENIED') {
    return { forbidden: true }
  }

  if (error.status === 400 && error.code === 'VALIDATION_ERROR') {
    return {
      fieldErrors: error.errors.filter(
        (item) =>
          typeof item.field === 'string' && typeof item.message === 'string',
      ),
    }
  }

  return {
    message:
      'Não foi possível salvar o cliente. Verifique sua conexão e tente novamente.',
    retry: true,
  }
}

function ClienteForm({
  cliente = null,
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
  onReload,
}) {
  const navigate = useNavigate()
  const [formAlert, setFormAlert] = useState(null)
  const [typeChangeWarning, setTypeChangeWarning] = useState('')
  const {
    control,
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: toFormValues(cliente),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const tipoPessoa = useWatch({ control, name: 'tipoPessoa' })

  const changeTipoPessoa = async (nextType) => {
    const currentDocument = onlyDigits(getValues('documento') || '')
    const expectedLength = nextType === 'FISICA' ? 11 : 14
    setValue('tipoPessoa', nextType, {
      shouldDirty: true,
      shouldValidate: true,
    })

    if (currentDocument && currentDocument.length !== expectedLength) {
      setValue('documento', '', { shouldDirty: true, shouldValidate: true })
      setTypeChangeWarning(
        'O documento foi removido porque não corresponde ao tipo de pessoa selecionado.',
      )
    } else {
      setTypeChangeWarning('')
      await trigger('documento')
    }
  }

  const save = async (values) => {
    setFormAlert(null)
    try {
      await onSubmit(values)
    } catch (error) {
      const result = resolveApiError(error)
      if (result.forbidden) {
        navigate('/acesso-negado', { replace: true })
        return
      }

      if (result.fieldErrors?.length) {
        let firstField = null
        for (const fieldError of result.fieldErrors) {
          if (
            ['tipoPessoa', 'nome', 'documento', 'email', 'telefone'].includes(
              fieldError.field,
            )
          ) {
            setError(fieldError.field, {
              type: 'server',
              message: fieldError.message,
            })
            firstField ||= fieldError.field
          }
        }
        if (firstField) {
          setFocus(firstField)
        } else {
          setFormAlert({
            message: 'Revise os dados informados e tente novamente.',
          })
        }
        return
      }

      setFormAlert(result)
    }
  }

  const reload = async () => {
    try {
      const freshCustomer = await onReload()
      if (freshCustomer) {
        reset(toFormValues(freshCustomer))
        setFormAlert(null)
      }
    } catch {
      setFormAlert({
        message: 'Não foi possível recarregar os dados. Tente novamente.',
        retryReload: true,
      })
    }
  }

  return (
    <Form noValidate onSubmit={handleSubmit(save)} aria-busy={pending}>
      {formAlert?.companyInactive && (
        <ErrorAlert>
          Cadastre ou ative a empresa para continuar.{' '}
          <Link to="/empresa">Acessar empresa</Link>
        </ErrorAlert>
      )}
      {formAlert && !formAlert.companyInactive && (
        <ErrorAlert
          onRetry={
            formAlert.reload || formAlert.retryReload
              ? reload
              : formAlert.retry
                ? handleSubmit(save)
                : undefined
          }
          retryLabel={
            formAlert.reload ? 'Recarregar dados' : 'Tentar novamente'
          }
        >
          {formAlert.message}
        </ErrorAlert>
      )}

      <fieldset disabled={pending} className="border-0 p-0 m-0">
        <Form.Group className="mb-3">
          <Form.Label>Tipo de pessoa</Form.Label>
          <Controller
            name="tipoPessoa"
            control={control}
            render={({ field }) => (
              <div
                role="radiogroup"
                aria-describedby={
                  errors.tipoPessoa ? 'cliente-tipo-error' : undefined
                }
              >
                <Form.Check
                  type="radio"
                  id="cliente-tipo-fisica"
                  name={field.name}
                  label="Pessoa física"
                  value="FISICA"
                  checked={field.value === 'FISICA'}
                  onChange={() => changeTipoPessoa('FISICA')}
                  onBlur={field.onBlur}
                  isInvalid={Boolean(errors.tipoPessoa)}
                  aria-invalid={Boolean(errors.tipoPessoa)}
                />
                <Form.Check
                  type="radio"
                  id="cliente-tipo-juridica"
                  name={field.name}
                  label="Pessoa jurídica"
                  value="JURIDICA"
                  checked={field.value === 'JURIDICA'}
                  onChange={() => changeTipoPessoa('JURIDICA')}
                  onBlur={field.onBlur}
                  isInvalid={Boolean(errors.tipoPessoa)}
                  aria-invalid={Boolean(errors.tipoPessoa)}
                />
              </div>
            )}
          />
          <div
            id="cliente-tipo-error"
            className="invalid-feedback d-block"
            role={errors.tipoPessoa ? 'alert' : undefined}
          >
            {errors.tipoPessoa?.message}
          </div>
        </Form.Group>

        {typeChangeWarning && (
          <p className="small" role="status" aria-live="polite">
            {typeChangeWarning}
          </p>
        )}

        <Form.Group className="mb-3" controlId="cliente-nome">
          <Form.Label>Nome ou razão social</Form.Label>
          <Form.Control
            type="text"
            autoComplete="name"
            maxLength={150}
            isInvalid={Boolean(errors.nome)}
            aria-invalid={Boolean(errors.nome)}
            aria-describedby={errors.nome ? 'cliente-nome-error' : undefined}
            {...register('nome')}
          />
          <Form.Control.Feedback
            id="cliente-nome-error"
            type="invalid"
            role={errors.nome ? 'alert' : undefined}
          >
            {errors.nome?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="cliente-documento">
          <Form.Label>{tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ'}</Form.Label>
          <Controller
            name="documento"
            control={control}
            render={({ field }) => (
              <DocumentoInput
                id="cliente-documento"
                tipoPessoa={tipoPessoa}
                value={field.value}
                inputRef={field.ref}
                onChange={(value) => {
                  setTypeChangeWarning('')
                  field.onChange(value)
                }}
                onBlur={field.onBlur}
                invalid={Boolean(errors.documento)}
                describedBy={
                  errors.documento ? 'cliente-documento-error' : undefined
                }
              />
            )}
          />
          <Form.Control.Feedback
            id="cliente-documento-error"
            type="invalid"
            role={errors.documento ? 'alert' : undefined}
          >
            {errors.documento?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="cliente-email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            maxLength={160}
            isInvalid={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'cliente-email-error' : undefined}
            {...register('email')}
          />
          <Form.Control.Feedback
            id="cliente-email-error"
            type="invalid"
            role={errors.email ? 'alert' : undefined}
          >
            {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4" controlId="cliente-telefone">
          <Form.Label>Telefone</Form.Label>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <Form.Control
                {...field}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={15}
                value={field.value || ''}
                onChange={(event) =>
                  field.onChange(formatPhone(event.target.value))
                }
                isInvalid={Boolean(errors.telefone)}
                aria-invalid={Boolean(errors.telefone)}
                aria-describedby={
                  errors.telefone ? 'cliente-telefone-error' : undefined
                }
              />
            )}
          />
          <Form.Control.Feedback
            id="cliente-telefone-error"
            type="invalid"
            role={errors.telefone ? 'alert' : undefined}
          >
            {errors.telefone?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </fieldset>

      <div className="d-flex flex-column flex-sm-row gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Salvando...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline-dark"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
        )}
      </div>
    </Form>
  )
}

export default ClienteForm
