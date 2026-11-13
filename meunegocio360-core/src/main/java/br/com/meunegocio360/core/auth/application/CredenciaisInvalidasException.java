package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/** Resposta única para e-mail inexistente, senha incorreta ou usuário inativo (RN-03). */
public class CredenciaisInvalidasException extends ApiException {

  public CredenciaisInvalidasException() {
    super(
        HttpStatus.UNAUTHORIZED,
        "INVALID_CREDENTIALS",
        "credenciais-invalidas",
        "Credenciais inválidas",
        "E-mail ou senha inválidos.");
  }
}
