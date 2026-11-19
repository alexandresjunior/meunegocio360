package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/** RN-02: só pode existir uma empresa ativa. */
public class EmpresaJaAtivaException extends ApiException {

  public EmpresaJaAtivaException() {
    super(
        HttpStatus.CONFLICT,
        "COMPANY_ALREADY_ACTIVE",
        "empresa-ja-ativa",
        "Já existe empresa ativa",
        "Já existe uma empresa ativa. Inative-a antes de cadastrar ou reativar outra.");
  }
}
