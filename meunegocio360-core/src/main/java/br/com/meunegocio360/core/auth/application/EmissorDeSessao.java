package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.EmissorDeTokenDeAcesso;
import br.com.meunegocio360.core.auth.domain.GeradorDeRefreshToken;
import br.com.meunegocio360.core.auth.domain.RefreshToken;
import br.com.meunegocio360.core.auth.domain.RefreshTokenRepository;
import br.com.meunegocio360.core.auth.domain.Usuario;
import java.time.Duration;
import java.time.Instant;
import org.springframework.stereotype.Component;

/** Emite o par token de acesso + refresh token, iniciando ou continuando uma família. */
@Component
class EmissorDeSessao {

  private final EmissorDeTokenDeAcesso emissorDeTokenDeAcesso;
  private final GeradorDeRefreshToken geradorDeRefreshToken;
  private final RefreshTokenRepository refreshTokens;
  private final Duration validadeDoRefresh;

  EmissorDeSessao(
      EmissorDeTokenDeAcesso emissorDeTokenDeAcesso,
      GeradorDeRefreshToken geradorDeRefreshToken,
      RefreshTokenRepository refreshTokens,
      AuthProperties propriedades) {
    this.emissorDeTokenDeAcesso = emissorDeTokenDeAcesso;
    this.geradorDeRefreshToken = geradorDeRefreshToken;
    this.refreshTokens = refreshTokens;
    this.validadeDoRefresh = propriedades.refresh().expiracao();
  }

  SessaoAutenticada novaSessao(Usuario usuario, Instant agora) {
    String valor = geradorDeRefreshToken.gerar();
    refreshTokens.save(
        RefreshToken.iniciarFamilia(
            usuario.getId(),
            geradorDeRefreshToken.hash(valor),
            agora.plus(validadeDoRefresh),
            agora));
    return sessao(usuario, valor);
  }

  SessaoAutenticada rotacionar(RefreshToken atual, Usuario usuario, Instant agora) {
    String valor = geradorDeRefreshToken.gerar();
    refreshTokens.save(
        atual.rotacionar(geradorDeRefreshToken.hash(valor), agora.plus(validadeDoRefresh), agora));
    return sessao(usuario, valor);
  }

  private SessaoAutenticada sessao(Usuario usuario, String refreshToken) {
    return new SessaoAutenticada(
        emissorDeTokenDeAcesso.emitir(usuario),
        refreshToken,
        validadeDoRefresh,
        DadosDoUsuario.de(usuario));
  }
}
