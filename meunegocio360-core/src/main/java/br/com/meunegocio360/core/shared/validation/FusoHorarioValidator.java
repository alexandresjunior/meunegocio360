package br.com.meunegocio360.core.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.ZoneId;

public class FusoHorarioValidator implements ConstraintValidator<FusoHorario, String> {

  @Override
  public boolean isValid(String valor, ConstraintValidatorContext contexto) {
    return valor == null || ZoneId.getAvailableZoneIds().contains(valor);
  }
}
