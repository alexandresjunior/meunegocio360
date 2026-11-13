package br.com.meunegocio360.core.shared.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Encaminha falhas de autenticação (token ausente, inválido ou expirado) ao
 * {@code @RestControllerAdvice} único, para que o 401 também saia em problem+json (RNF-BE-14).
 */
@Component
public class ProblemaDeAutenticacaoEntryPoint implements AuthenticationEntryPoint {

  private final HandlerExceptionResolver resolver;

  public ProblemaDeAutenticacaoEntryPoint(
      @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
    this.resolver = resolver;
  }

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException) {
    resolver.resolveException(request, response, null, authException);
  }
}
