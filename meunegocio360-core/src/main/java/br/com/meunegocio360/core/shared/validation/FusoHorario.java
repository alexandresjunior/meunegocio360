package br.com.meunegocio360.core.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Identificador de fuso horário do banco IANA (ex.: America/Sao_Paulo). Deslocamentos soltos como
 * "-03:00" não são aceitos. Valores nulos são aceitos.
 */
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FusoHorarioValidator.class)
public @interface FusoHorario {

  String message() default "deve ser um fuso horário IANA válido, como America/Sao_Paulo";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
