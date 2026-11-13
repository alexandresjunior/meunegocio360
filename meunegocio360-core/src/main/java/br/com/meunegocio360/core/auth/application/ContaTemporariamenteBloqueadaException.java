package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

/** Conta bloqueada por excesso de tentativas (RN-04), com {@code Retry-After} em segundos. */
public class ContaTemporariamenteBloqueadaException extends ApiException {

  public ContaTemporariamenteBloqueadaException(long segundosRestantes) {
    super(
        HttpStatus.TOO_MANY_REQUESTS,
        "ACCOUNT_TEMPORARILY_LOCKED",
        "conta-temporariamente-bloqueada",
        "Conta temporariamente bloqueada",
        "Muitas tentativas de login. Tente novamente mais tarde.",
        Map.of(HttpHeaders.RETRY_AFTER, Long.toString(segundosRestantes)));
  }
}
