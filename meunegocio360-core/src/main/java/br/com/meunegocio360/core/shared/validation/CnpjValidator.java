package br.com.meunegocio360.core.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnpjValidator implements ConstraintValidator<Cnpj, String> {

  @Override
  public boolean isValid(String valor, ConstraintValidatorContext contexto) {
    return valor == null || DocumentoFiscal.cnpjValido(valor);
  }
}
