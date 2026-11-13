package br.com.meunegocio360.core.shared.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lê ou gera o {@code X-Request-Id}, coloca-o no MDC dos logs e o devolve na resposta (RNF-050,
 * RNF-BE-43). Executa antes da cadeia de segurança, para que até os 401 tenham {@code traceId}.
 * Valores recebidos fora do formato esperado são descartados (evita injeção em logs).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

  public static final String CABECALHO = "X-Request-Id";
  public static final String CHAVE_MDC = "requestId";
  private static final Pattern FORMATO_VALIDO = Pattern.compile("[A-Za-z0-9._-]{1,64}");

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String recebido = request.getHeader(CABECALHO);
    String requestId =
        recebido != null && FORMATO_VALIDO.matcher(recebido).matches()
            ? recebido
            : UUID.randomUUID().toString();
    MDC.put(CHAVE_MDC, requestId);
    response.setHeader(CABECALHO, requestId);
    try {
      chain.doFilter(request, response);
    } finally {
      MDC.remove(CHAVE_MDC);
    }
  }
}
