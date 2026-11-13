package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.RefreshTokenRepository;
import java.time.Clock;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Remove tokens expirados ou revogados há mais do que o período de retenção (30 dias). */
@Service
public class LimparRefreshTokensExpirados {

  private static final Logger log = LoggerFactory.getLogger(LimparRefreshTokensExpirados.class);

  private final RefreshTokenRepository refreshTokens;
  private final Duration retencao;
  private final Clock clock;

  public LimparRefreshTokensExpirados(
      RefreshTokenRepository refreshTokens, AuthProperties propriedades, Clock clock) {
    this.refreshTokens = refreshTokens;
    this.retencao = propriedades.refresh().retencao();
    this.clock = clock;
  }

  @Transactional
  public void executar() {
    int removidos =
        refreshTokens.removerExpiradosOuRevogadosAntesDe(clock.instant().minus(retencao));
    log.info("Limpeza de refresh tokens concluída: {} registros removidos", removidos);
  }
}
