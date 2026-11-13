package br.com.meunegocio360.core.shared.security;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Origens permitidas do frontend, lidas de CORS_ALLOWED_ORIGINS (RNF-BE-42). A mesma lista é usada
 * na verificação do cabeçalho Origin de /auth/refresh e /auth/logout (RNF-BE-40).
 */
@ConfigurationProperties("app.cors")
public record CorsProperties(List<String> allowedOrigins) {

  public CorsProperties {
    allowedOrigins =
        allowedOrigins == null
            ? List.of()
            : allowedOrigins.stream().map(String::trim).filter(o -> !o.isEmpty()).toList();
    if (allowedOrigins.isEmpty()) {
      throw new IllegalStateException("CORS_ALLOWED_ORIGINS deve conter ao menos uma origem.");
    }
    if (allowedOrigins.stream().anyMatch(o -> o.contains("*"))) {
      throw new IllegalStateException("CORS_ALLOWED_ORIGINS não pode conter curinga (*).");
    }
  }

  public boolean permite(String origem) {
    return allowedOrigins.contains(origem);
  }
}
