package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

/** Token válido, mas o usuário dono dele não existe mais ou está inativo. */
public class UsuarioNaoAutenticadoException extends ApiException {

  public UsuarioNaoAutenticadoException() {
    super(
        HttpStatus.UNAUTHORIZED,
        "UNAUTHORIZED",
        "nao-autenticado",
        "Não autenticado",
        "Autenticação necessária ou token de acesso inválido.",
        Map.of(HttpHeaders.WWW_AUTHENTICATE, "Bearer"));
  }
}
