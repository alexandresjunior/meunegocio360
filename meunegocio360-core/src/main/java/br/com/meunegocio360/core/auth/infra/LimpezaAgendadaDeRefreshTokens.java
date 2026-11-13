package br.com.meunegocio360.core.auth.infra;

import br.com.meunegocio360.core.auth.application.LimparRefreshTokensExpirados;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Dispara diariamente a limpeza de refresh tokens antigos (RF-BE-001, Modelo de dados). */
@Component
class LimpezaAgendadaDeRefreshTokens {

  private final LimparRefreshTokensExpirados limpar;

  LimpezaAgendadaDeRefreshTokens(LimparRefreshTokensExpirados limpar) {
    this.limpar = limpar;
  }

  @Scheduled(cron = "${app.auth.refresh.limpeza-cron}", zone = "UTC")
  void executar() {
    limpar.executar();
  }
}
