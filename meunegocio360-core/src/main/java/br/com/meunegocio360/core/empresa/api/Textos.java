package br.com.meunegocio360.core.empresa.api;

/** Normalização dos textos recebidos (RN-06). */
final class Textos {

  private Textos() {}

  static String aparar(String valor) {
    return valor == null ? null : valor.trim();
  }

  /** Campo opcional: em branco equivale a não informado. */
  static String opcional(String valor) {
    String aparado = aparar(valor);
    return aparado == null || aparado.isEmpty() ? null : aparado;
  }
}
