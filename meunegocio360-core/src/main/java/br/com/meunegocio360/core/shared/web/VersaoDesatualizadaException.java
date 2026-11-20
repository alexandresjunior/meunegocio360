package br.com.meunegocio360.core.shared.web;

import org.springframework.http.HttpStatus;

/** A versão enviada não é a atual: o registro foi alterado por outra pessoa (RNF-BE-28). */
public class VersaoDesatualizadaException extends ApiException {

  public VersaoDesatualizadaException() {
    super(
        HttpStatus.CONFLICT,
        "VERSION_CONFLICT",
        "conflito-de-versao",
        "Conflito de versão",
        "O registro foi alterado por outra pessoa. Recarregue os dados e tente novamente.");
  }
}
