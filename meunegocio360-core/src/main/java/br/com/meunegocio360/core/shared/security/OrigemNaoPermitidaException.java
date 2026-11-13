package br.com.meunegocio360.core.shared.security;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

public class OrigemNaoPermitidaException extends ApiException {

  public OrigemNaoPermitidaException() {
    super(
        HttpStatus.FORBIDDEN,
        "ORIGIN_NOT_ALLOWED",
        "origem-nao-permitida",
        "Origem não permitida",
        "A origem da requisição não é permitida.");
  }
}
