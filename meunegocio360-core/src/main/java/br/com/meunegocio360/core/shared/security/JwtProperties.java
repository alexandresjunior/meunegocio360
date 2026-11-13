package br.com.meunegocio360.core.shared.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuração do token de acesso (RN-05). Falha na inicialização se o segredo for fraco
 * (RNF-BE-32).
 */
@ConfigurationProperties("app.auth.jwt")
public record JwtProperties(String secret, String issuer, int expiracaoMinutos) {

  static final int TAMANHO_MINIMO_SEGREDO_BYTES = 32;

  public JwtProperties {
    if (secret == null
        || secret.isBlank()
        || secret.getBytes(StandardCharsets.UTF_8).length < TAMANHO_MINIMO_SEGREDO_BYTES) {
      throw new IllegalStateException(
          "JWT_SECRET é obrigatório e deve ter pelo menos "
              + TAMANHO_MINIMO_SEGREDO_BYTES
              + " bytes (gere com: openssl rand -base64 48).");
    }
    if (issuer == null || issuer.isBlank()) {
      throw new IllegalStateException("app.auth.jwt.issuer é obrigatório.");
    }
    if (expiracaoMinutos <= 0) {
      throw new IllegalStateException("APP_AUTH_JWT_EXPIRACAO_MINUTOS deve ser positivo.");
    }
  }

  public Duration expiracao() {
    return Duration.ofMinutes(expiracaoMinutos);
  }

  @Override
  public String toString() {
    return "JwtProperties[issuer=" + issuer + ", expiracaoMinutos=" + expiracaoMinutos + "]";
  }
}
