package br.com.meunegocio360.core.shared.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Processador de CORS que, ao rejeitar uma origem, responde em problem+json com {@code code:
 * "ORIGIN_NOT_ALLOWED"} (RNF-BE-14, RNF-BE-40), em vez do texto padrão do Spring.
 */
class ProcessadorCorsComProblema extends DefaultCorsProcessor {

  private final HandlerExceptionResolver resolver;

  ProcessadorCorsComProblema(HandlerExceptionResolver resolver) {
    this.resolver = resolver;
  }

  @Override
  public boolean processRequest(
      CorsConfiguration config, HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    boolean aceita = super.processRequest(config, request, response);
    if (!aceita) {
      resolver.resolveException(request, response, null, new OrigemNaoPermitidaException());
    }
    return aceita;
  }

  /** A resposta de rejeição é escrita em {@link #processRequest}, pelo tratador único de erros. */
  @Override
  protected void rejectRequest(ServerHttpResponse response) {}
}
