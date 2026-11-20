package br.com.meunegocio360.core.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * CNPJ com 14 dígitos e dígitos verificadores válidos. Valores nulos são aceitos (use @NotBlank).
 */
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CnpjValidator.class)
public @interface Cnpj {

  String message() default "deve ser um CNPJ válido, com 14 dígitos e sem máscara";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
