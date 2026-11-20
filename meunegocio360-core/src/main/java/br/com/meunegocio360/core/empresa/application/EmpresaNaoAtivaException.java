package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/**
 * Operação de negócio sem empresa ativa (RN-04, RNF-096). Lançada por {@link EmpresaAtiva} e usada
 * pelos cadastros de RF-BE-003 em diante.
 */
public class EmpresaNaoAtivaException extends ApiException {

  public EmpresaNaoAtivaException() {
    super(
        HttpStatus.UNPROCESSABLE_CONTENT,
        "COMPANY_NOT_ACTIVE",
        "empresa-nao-ativa",
        "Empresa não ativa",
        "Não há empresa ativa. Cadastre ou reative a empresa antes de continuar.");
  }
}
