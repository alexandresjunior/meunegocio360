package br.com.meunegocio360.core.auth.application;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Parâmetros configuráveis da autenticação (RN-04, RN-06). */
@ConfigurationProperties("app.auth")
public record AuthProperties(
    int maxTentativas, int bloqueioMinutos, Refresh refresh, Cookie cookie) {

  public AuthProperties {
    if (maxTentativas <= 0 || bloqueioMinutos <= 0) {
      throw new IllegalStateException(
          "APP_AUTH_MAX_TENTATIVAS e APP_AUTH_BLOQUEIO_MINUTOS devem ser positivos.");
    }
    if (refresh == null || refresh.expiracaoDias() <= 0 || refresh.retencaoDias() <= 0) {
      throw new IllegalStateException("APP_AUTH_REFRESH_EXPIRACAO_DIAS deve ser positivo.");
    }
    if (cookie == null) {
      cookie = new Cookie(true);
    }
  }

  public Duration bloqueio() {
    return Duration.ofMinutes(bloqueioMinutos);
  }

  public record Refresh(int expiracaoDias, int retencaoDias) {

    public Duration expiracao() {
      return Duration.ofDays(expiracaoDias);
    }

    public Duration retencao() {
      return Duration.ofDays(retencaoDias);
    }
  }

  public record Cookie(boolean secure) {}
}
