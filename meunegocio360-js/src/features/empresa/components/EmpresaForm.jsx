import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/lib/http.js'
import {
  formatCnpj,
  formatPhone,
} from '../../../shared/lib/companyFormatting.js'
import { ErrorAlert } from '../../../shared/ui/ErrorAlert.jsx'
import { FUSOS_HORARIOS_BRASIL, empresaSchema } from '../schemas.js'

function toFormValues(empresa) {
  return {
    razaoSocial: empresa?.razaoSocial || '',
    nomeFantasia: empresa?.nomeFantasia || '',
    cnpj: formatCnpj(empresa?.cnpj || ''),
    email: empresa?.email || '',
    telefone: formatPhone(empresa?.telefone || ''),
    fusoHorario: empresa?.fusoHorario || 'America/Sao_Paulo',
    moeda: empresa?.moeda || 'BRL',
  }
}

function resolveApiError(error) {
  if (!(error instanceof ApiError)) {
    throw error
  }

  if (error.status === 409 && error.code === 'COMPANY_CNPJ_DUPLICATE') {
    return {
      fieldErrors: [
        {
          field: 'cnpj',
          message: 'Já existe uma empresa cadastrada com este CNPJ.',
        },
      ],
    }
  }

  if (error.status === 409 && error.code === 'VERSION_CONFLICT') {
    return {
      message: 'Os dados da empresa foram alterados por outra operação.',
      reload: true,
    }
  }

  if (error.status === 409 && error.code === 'COMPANY_ALREADY_ACTIVE') {
    return {
      message:
        'Já existe uma empresa ativa. Inative-a antes de cadastrar ou reativar outra.',
    }
  }

  if (error.status === 403 && error.code === 'ACCESS_DENIED') {
    return {
      message: 'Você não tem permissão para alterar os dados da empresa.',
    }
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
      'Não foi possível salvar os dados da empresa. Verifique sua conexão e tente novamente.',
    retry: true,
  }
}

function EmpresaForm({
  empresa = null,
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
  onReload,
}) {
  const [formAlert, setFormAlert] = useState(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(empresaSchema),
    defaultValues: toFormValues(empresa),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const save = async (values) => {
    setFormAlert(null)
    try {
      await onSubmit(values)
    } catch (error) {
      const result = resolveApiError(error)
      if (result.fieldErrors?.length) {
        let firstField = null
        for (const fieldError of result.fieldErrors) {
          if (
            [
              'razaoSocial',
              'nomeFantasia',
              'cnpj',
              'email',
              'telefone',
              'fusoHorario',
            ].includes(fieldError.field)
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
      const freshCompany = await onReload()
      if (freshCompany) {
        reset(toFormValues(freshCompany))
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
      {formAlert && (
        <ErrorAlert
          onRetry={
            formAlert.reload
              ? reload
              : formAlert.retryReload
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

      <Form.Group className="mb-3" controlId="empresa-razao-social">
        <Form.Label>Razão social</Form.Label>
        <Form.Control
          type="text"
          autoComplete="organization"
          maxLength={150}
          isInvalid={Boolean(errors.razaoSocial)}
          aria-invalid={Boolean(errors.razaoSocial)}
          aria-describedby={
            errors.razaoSocial ? 'empresa-razao-social-error' : undefined
          }
          {...register('razaoSocial')}
        />
        <Form.Control.Feedback
          id="empresa-razao-social-error"
          type="invalid"
          role={errors.razaoSocial ? 'alert' : undefined}
        >
          {errors.razaoSocial?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="empresa-nome-fantasia">
        <Form.Label>Nome fantasia</Form.Label>
        <Form.Control
          type="text"
          autoComplete="organization-title"
          maxLength={150}
          isInvalid={Boolean(errors.nomeFantasia)}
          aria-invalid={Boolean(errors.nomeFantasia)}
          aria-describedby={
            errors.nomeFantasia ? 'empresa-nome-fantasia-error' : undefined
          }
          {...register('nomeFantasia')}
        />
        <Form.Control.Feedback
          id="empresa-nome-fantasia-error"
          type="invalid"
          role={errors.nomeFantasia ? 'alert' : undefined}
        >
          {errors.nomeFantasia?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="empresa-cnpj">
        <Form.Label>CNPJ</Form.Label>
        <Controller
          name="cnpj"
          control={control}
          render={({ field }) => (
            <Form.Control
              {...field}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={18}
              value={field.value || ''}
              onChange={(event) =>
                field.onChange(formatCnpj(event.target.value))
              }
              isInvalid={Boolean(errors.cnpj)}
              aria-invalid={Boolean(errors.cnpj)}
              aria-describedby={errors.cnpj ? 'empresa-cnpj-error' : undefined}
            />
          )}
        />
        <Form.Control.Feedback
          id="empresa-cnpj-error"
          type="invalid"
          role={errors.cnpj ? 'alert' : undefined}
        >
          {errors.cnpj?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="empresa-email">
        <Form.Label>E-mail</Form.Label>
        <Form.Control
          type="email"
          autoComplete="email"
          maxLength={160}
          isInvalid={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'empresa-email-error' : undefined}
          {...register('email')}
        />
        <Form.Control.Feedback
          id="empresa-email-error"
          type="invalid"
          role={errors.email ? 'alert' : undefined}
        >
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="empresa-telefone">
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
                errors.telefone ? 'empresa-telefone-error' : undefined
              }
            />
          )}
        />
        <Form.Control.Feedback
          id="empresa-telefone-error"
          type="invalid"
          role={errors.telefone ? 'alert' : undefined}
        >
          {errors.telefone?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="row">
        <Form.Group className="col-md-8 mb-3" controlId="empresa-fuso">
          <Form.Label>Fuso horário</Form.Label>
          <Form.Select
            isInvalid={Boolean(errors.fusoHorario)}
            aria-invalid={Boolean(errors.fusoHorario)}
            aria-describedby={
              errors.fusoHorario ? 'empresa-fuso-error' : undefined
            }
            {...register('fusoHorario')}
          >
            {FUSOS_HORARIOS_BRASIL.map((fuso) => (
              <option value={fuso.value} key={fuso.value}>
                {fuso.label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback
            id="empresa-fuso-error"
            type="invalid"
            role={errors.fusoHorario ? 'alert' : undefined}
          >
            {errors.fusoHorario?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="col-md-4 mb-3" controlId="empresa-moeda">
          <Form.Label>Moeda</Form.Label>
          <Form.Select value="BRL" disabled aria-label="Moeda">
            <option value="BRL">BRL — Real</option>
          </Form.Select>
          <input type="hidden" {...register('moeda')} value="BRL" />
        </Form.Group>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
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

export default EmpresaForm
