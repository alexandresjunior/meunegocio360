package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.GeradorDeRefreshToken;
import br.com.meunegocio360.core.auth.domain.RefreshTokenRepository;
import java.time.Clock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Caso de uso de logout: revoga a família do refresh token apresentado (RN-10). Idempotente. */
@Service
public class EncerrarSessao {

  private final RefreshTokenRepository refreshTokens;
  private final GeradorDeRefreshToken geradorDeRefreshToken;
  private final Clock clock;

  public EncerrarSessao(
      RefreshTokenRepository refreshTokens,
      GeradorDeRefreshToken geradorDeRefreshToken,
      Clock clock) {
    this.refreshTokens = refreshTokens;
    this.geradorDeRefreshToken = geradorDeRefreshToken;
    this.clock = clock;
  }

  @Transactional
  public void executar(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      return;
    }
    refreshTokens
        .buscarPorHashParaAtualizacao(geradorDeRefreshToken.hash(refreshToken))
        .ifPresent(token -> refreshTokens.revogarFamilia(token.getFamiliaId(), clock.instant()));
  }
}
