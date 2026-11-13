package br.com.meunegocio360.core.auth.api;

import br.com.meunegocio360.core.auth.application.AuthProperties;
import java.time.Duration;
import java.util.Arrays;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Monta o cookie do refresh token: HttpOnly, Secure, SameSite=Strict, Path=/api/v1/auth e Max-Age
 * igual à validade do token (RF-BE-001, "Cookie de refresh"). Secure só pode ser desligado no
 * perfil dev.
 */
@Component
class CookieDeRefresh {

  static final String NOME = "mn360_refresh";
  static final String CAMINHO = "/api/v1/auth";

  private final boolean secure;

  CookieDeRefresh(AuthProperties propriedades, Environment ambiente) {
    this.secure = propriedades.cookie().secure();
    boolean perfilDev = Arrays.asList(ambiente.getActiveProfiles()).contains("dev");
    if (!secure && !perfilDev) {
      throw new IllegalStateException("APP_AUTH_COOKIE_SECURE=false só é permitido no perfil dev.");
    }
  }

  String criar(String refreshToken, Duration validade) {
    return base(refreshToken).maxAge(validade).build().toString();
  }

  /** Cookie que expira imediatamente (logout e refresh inválido). */
  String expirar() {
    return base("").maxAge(Duration.ZERO).build().toString();
  }

  private ResponseCookie.ResponseCookieBuilder base(String valor) {
    return ResponseCookie.from(NOME, valor)
        .httpOnly(true)
        .secure(secure)
        .sameSite("Strict")
        .path(CAMINHO);
  }
}
