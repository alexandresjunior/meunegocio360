import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import { useFormularioLogin } from '../hooks/useFormularioLogin.js'

function mensagemDeFalha(falha, minutos) {
  switch (falha?.tipo) {
    case 'credenciais':
      return 'E-mail ou senha inválidos.'
    case 'bloqueio':
      return `Muitas tentativas. Tente novamente em ${minutos} ${
        minutos === 1 ? 'minuto' : 'minutos'
      }.`
    case 'indisponivel':
      return 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.'
    default:
      return null
  }
}

/**
 * Formulário de login (RF-FE-001; RNF-FE-20 a RNF-FE-23 e RNF-FE-25).
 * Rótulos visíveis, autocomplete correto, erros ligados por aria-describedby e
 * anunciados por role="alert". Colar e gerenciadores de senha não são bloqueados.
 */
export function FormularioLogin() {
  const {
    form,
    enviar,
    enviando,
    bloqueado,
    minutosRestantes,
    falha,
    alertaRef,
  } = useFormularioLogin()
  const {
    register,
    formState: { errors },
  } = form
  const mensagem = mensagemDeFalha(falha, minutosRestantes)

  return (
    <Form noValidate onSubmit={enviar}>
      {mensagem && (
        <Alert
          ref={alertaRef}
          variant="danger"
          role="alert"
          tabIndex={-1}
          transition={false}
        >
          <p className="mb-0">
            <strong>Erro:</strong> {mensagem}
          </p>
          {falha.tipo === 'indisponivel' && (
            <Button
              type="button"
              variant="outline-dark"
              className="mt-3"
              onClick={enviar}
              disabled={enviando}
            >
              Tentar novamente
            </Button>
          )}
        </Alert>
      )}

      <Form.Group className="mb-3" controlId="login-email">
        <Form.Label>E-mail</Form.Label>
        <Form.Control
          type="email"
          inputMode="email"
          autoComplete="username"
          size="lg"
          isInvalid={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-erro' : undefined}
          {...register('email')}
        />
        <Form.Control.Feedback type="invalid" id="login-email-erro">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="login-senha">
        <Form.Label>Senha</Form.Label>
        <Form.Control
          type="password"
          autoComplete="current-password"
          size="lg"
          isInvalid={Boolean(errors.senha)}
          aria-invalid={Boolean(errors.senha)}
          aria-describedby={errors.senha ? 'login-senha-erro' : undefined}
          {...register('senha')}
        />
        <Form.Control.Feedback type="invalid" id="login-senha-erro">
          {errors.senha?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-100"
        disabled={enviando || bloqueado}
      >
        {enviando ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              aria-hidden="true"
              className="me-2"
            />
            Entrando…
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </Form>
  )
}
