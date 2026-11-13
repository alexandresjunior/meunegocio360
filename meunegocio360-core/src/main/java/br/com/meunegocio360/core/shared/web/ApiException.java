package br.com.meunegocio360.core.shared.web;

import java.util.Map;
import org.springframework.http.HttpStatus;

/**
 * Exceção com status, código estável ({@code code}) e textos do problem+json (RNF-BE-14). O {@code
 * code} é o que o frontend usa para decidir o comportamento; o texto nunca.
 */
public abstract class ApiException extends RuntimeException {

  private final HttpStatus status;
  private final String code;
  private final String tipo;
  private final String titulo;
  private final Map<String, String> cabecalhos;

  protected ApiException(
      HttpStatus status, String code, String tipo, String titulo, String detalhe) {
    this(status, code, tipo, titulo, detalhe, Map.of());
  }

  protected ApiException(
      HttpStatus status,
      String code,
      String tipo,
      String titulo,
      String detalhe,
      Map<String, String> cabecalhos) {
    super(detalhe, null, false, false);
    this.status = status;
    this.code = code;
    this.tipo = tipo;
    this.titulo = titulo;
    this.cabecalhos = Map.copyOf(cabecalhos);
  }

  public HttpStatus getStatus() {
    return status;
  }

  public String getCode() {
    return code;
  }

  public String getTipo() {
    return tipo;
  }

  public String getTitulo() {
    return titulo;
  }

  /** Cabeçalhos HTTP adicionais da resposta de erro (por exemplo, Retry-After). */
  public Map<String, String> getCabecalhos() {
    return cabecalhos;
  }
}
