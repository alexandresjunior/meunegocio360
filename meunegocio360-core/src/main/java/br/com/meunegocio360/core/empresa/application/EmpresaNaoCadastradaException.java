package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/** GET /empresa sem empresa ativa: a interface usa este código para iniciar o primeiro cadastro. */
public class EmpresaNaoCadastradaException extends ApiException {

  public EmpresaNaoCadastradaException() {
    super(
        HttpStatus.NOT_FOUND,
        "COMPANY_NOT_REGISTERED",
        "empresa-nao-cadastrada",
        "Empresa não cadastrada",
        "Não há empresa ativa cadastrada.");
  }
}
