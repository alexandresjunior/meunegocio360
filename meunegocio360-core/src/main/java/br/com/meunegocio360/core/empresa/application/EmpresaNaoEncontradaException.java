package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/** PUT ou PATCH com um id de empresa que não existe. */
public class EmpresaNaoEncontradaException extends ApiException {

  public EmpresaNaoEncontradaException() {
    super(
        HttpStatus.NOT_FOUND,
        "COMPANY_NOT_FOUND",
        "empresa-nao-encontrada",
        "Empresa não encontrada",
        "A empresa informada não existe.");
  }
}
