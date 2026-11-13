package br.com.meunegocio360.core.auth.api;

import br.com.meunegocio360.core.auth.application.SessaoAutenticada;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Resposta de login e de refresh. O refresh token NÃO aparece aqui: ele vai somente no cookie
 * HttpOnly (RN-06).
 */
public record LoginResponse(
    @Schema(example = "Bearer") String tokenType,
    @Schema(example = "eyJhbGciOi...") String accessToken,
    @Schema(example = "900", description = "Validade do token de acesso, em segundos")
        long expiresIn,
    UsuarioResponse usuario) {

  static LoginResponse de(SessaoAutenticada sessao) {
    return new LoginResponse(
        "Bearer",
        sessao.tokenDeAcesso().valor(),
        sessao.tokenDeAcesso().expiraEmSegundos(),
        UsuarioResponse.de(sessao.usuario()));
  }

  @Override
  public String toString() {
    return "LoginResponse[tokenType=" + tokenType + ", accessToken=***, usuario=" + usuario + "]";
  }
}
