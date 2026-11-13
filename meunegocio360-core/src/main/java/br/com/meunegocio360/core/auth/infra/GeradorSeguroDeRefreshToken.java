package br.com.meunegocio360.core.auth.infra;

import br.com.meunegocio360.core.auth.domain.GeradorDeRefreshToken;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

/**
 * Refresh token de 256 bits gerado com {@link SecureRandom} e codificado em Base64 URL-safe
 * (RN-06). O hash SHA-256 é adequado aqui porque o valor já é aleatório e de alta entropia (RN-09).
 */
@Component
class GeradorSeguroDeRefreshToken implements GeradorDeRefreshToken {

  private static final int TAMANHO_BYTES = 32;

  private final SecureRandom secureRandom = new SecureRandom();

  @Override
  public String gerar() {
    byte[] bytes = new byte[TAMANHO_BYTES];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  @Override
  public String hash(String valorEmClaro) {
    try {
      byte[] digest =
          MessageDigest.getInstance("SHA-256")
              .digest(valorEmClaro.getBytes(StandardCharsets.US_ASCII));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 indisponível na JVM", e);
    }
  }
}
