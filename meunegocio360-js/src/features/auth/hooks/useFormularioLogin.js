import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/lib/http.js'
import { esquemaLogin } from '../schemas.js'
import { useContagemRegressiva } from './useContagemRegressiva.js'
import { useLogin } from './useLogin.js'

const CAMPOS = ['email', 'senha']

/**
 * Estado e comportamento do formulário de login (RF-FE-001, "Comportamentos e
 * mensagens"). As decisões usam o campo `code` do erro, nunca o texto (RNF-FE-14),
 * e o `detail` do servidor nunca é exibido.
 *
 * falha.tipo: 'credenciais' | 'bloqueio' | 'indisponivel'
 */
export function useFormularioLogin() {
  const form = useForm({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: '', senha: '' },
    // Valida no envio e, depois do primeiro envio, a cada alteração.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    // Foco no primeiro campo inválido (RNF-FE-22).
    shouldFocusError: true,
  })
  const { setError, setValue, setFocus, reset } = form
  const login = useLogin()
  const { restantes, iniciar } = useContagemRegressiva()
  const [falha, setFalha] = useState(null)
  const alertaRef = useRef(null)

  // Bloqueio e indisponibilidade não têm campo a corrigir: o foco vai à mensagem.
  useEffect(() => {
    if (falha?.tipo === 'bloqueio' || falha?.tipo === 'indisponivel') {
      alertaRef.current?.focus()
    }
  }, [falha])

  function tratarErro(erro) {
    const code = erro instanceof ApiError ? erro.code : null

    if (code === 'INVALID_CREDENTIALS') {
      // Mantém o e-mail, limpa a senha e devolve o foco a ela.
      setFalha({ tipo: 'credenciais' })
      setValue('senha', '')
      setFocus('senha')
      return
    }

    if (code === 'ACCOUNT_TEMPORARILY_LOCKED') {
      iniciar(erro.retryAfter ?? 60)
      setFalha({ tipo: 'bloqueio' })
      return
    }

    if (code === 'VALIDATION_ERROR') {
      const errosDeCampo = erro.errors.filter((e) => CAMPOS.includes(e.field))
      if (errosDeCampo.length > 0) {
        errosDeCampo.forEach(({ field, message }) =>
          setError(field, { type: 'server', message }),
        )
        setFocus(errosDeCampo[0].field)
        setFalha(null)
        return
      }
    }

    // Rede, timeout, 5xx ou resposta inesperada.
    setFalha({ tipo: 'indisponivel' })
  }

  const enviar = form.handleSubmit((dados) => {
    setFalha(null)
    login.mutate(dados, { onSuccess: () => reset(), onError: tratarErro })
  })

  const bloqueado = restantes > 0

  return {
    form,
    enviar,
    enviando: login.isPending,
    bloqueado,
    minutosRestantes: Math.ceil(restantes / 60),
    // A mensagem de bloqueio some quando a contagem termina.
    falha: falha?.tipo === 'bloqueio' && !bloqueado ? null : falha,
    alertaRef,
  }
}
