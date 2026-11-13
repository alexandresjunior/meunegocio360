package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/** Refresh token ausente, desconhecido, expirado, revogado ou de usuário sem acesso. */
public class RefreshTokenInvalidoException extends ApiException {

  public RefreshTokenInvalidoException() {
    super(
        HttpStatus.UNAUTHORIZED,
        "INVALID_REFRESH_TOKEN",
        "refresh-token-invalido",
        "Sessão inválida",
        "A sessão expirou ou é inválida. Faça login novamente.");
  }
}
