package br.com.meunegocio360.core.shared.security;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * Emissão e validação do JWT de acesso com HS256 (RF-BE-001, seção "Token de acesso"). O decoder
 * aceita somente HS256 (rejeita "alg: none" e outros algoritmos) e valida emissor e expiração.
 */
@Configuration
public class JwtConfig {

  private static final String ID_DA_CHAVE = "mn360-hs256-v1";

  private final SecretKey chave;

  public JwtConfig(JwtProperties propriedades) {
    this.chave =
        new SecretKeySpec(propriedades.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
  }

  @Bean
  public JwtEncoder jwtEncoder() {
    // kid fixo: o padrão do Nimbus seria o thumbprint do segredo, que não deve ir no token.
    return NimbusJwtEncoder.withSecretKey(chave)
        .algorithm(MacAlgorithm.HS256)
        .jwkPostProcessor(jwk -> jwk.keyID(ID_DA_CHAVE))
        .build();
  }

  @Bean
  public JwtDecoder jwtDecoder(JwtProperties propriedades, Clock clock) {
    NimbusJwtDecoder decoder =
        NimbusJwtDecoder.withSecretKey(chave).macAlgorithm(MacAlgorithm.HS256).build();
    JwtTimestampValidator validadorDeTempo = new JwtTimestampValidator();
    validadorDeTempo.setClock(clock);
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            validadorDeTempo, new JwtIssuerValidator(propriedades.issuer())));
    return decoder;
  }
}
