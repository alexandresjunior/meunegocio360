package br.com.meunegocio360.core.auth.domain;

/** Token de acesso emitido e sua validade em segundos. */
public record TokenDeAcesso(String valor, long expiraEmSegundos) {

  @Override
  public String toString() {
    return "TokenDeAcesso[valor=***, expiraEmSegundos=" + expiraEmSegundos + "]";
  }
}
