package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.TokenDeAcesso;
import java.time.Duration;

/**
 * Resultado de login ou renovação: token de acesso, refresh token em claro (que só sai em cookie,
 * RN-06) e sua validade.
 */
public record SessaoAutenticada(
    TokenDeAcesso tokenDeAcesso,
    String refreshToken,
    Duration validadeDoRefreshToken,
    DadosDoUsuario usuario) {

  @Override
  public String toString() {
    return "SessaoAutenticada[usuario=" + usuario + "]";
  }
}
