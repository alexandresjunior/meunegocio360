package br.com.meunegocio360.core.empresa.application;

import br.com.meunegocio360.core.shared.web.ApiException;
import org.springframework.http.HttpStatus;

/** RN-01: o CNPJ é único entre todas as empresas, ativas ou inativas. */
public class CnpjJaCadastradoException extends ApiException {

  public CnpjJaCadastradoException() {
    super(
        HttpStatus.CONFLICT,
        "COMPANY_CNPJ_DUPLICATE",
        "cnpj-ja-cadastrado",
        "CNPJ já cadastrado",
        "Já existe uma empresa com este CNPJ, que pode estar inativa.");
  }
}
