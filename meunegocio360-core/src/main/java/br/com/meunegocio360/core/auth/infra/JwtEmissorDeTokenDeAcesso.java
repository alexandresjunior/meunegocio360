package br.com.meunegocio360.core.auth.infra;

import br.com.meunegocio360.core.auth.domain.EmissorDeTokenDeAcesso;
import br.com.meunegocio360.core.auth.domain.TokenDeAcesso;
import br.com.meunegocio360.core.auth.domain.Usuario;
import br.com.meunegocio360.core.shared.security.JwtProperties;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

/**
 * Emite o JWT de acesso com as claims iss, sub, iat, exp, jti e perfil, sem dados pessoais (RN-05).
 */
@Component
class JwtEmissorDeTokenDeAcesso implements EmissorDeTokenDeAcesso {

  private final JwtEncoder encoder;
  private final JwtProperties propriedades;
  private final Clock clock;

  JwtEmissorDeTokenDeAcesso(JwtEncoder encoder, JwtProperties propriedades, Clock clock) {
    this.encoder = encoder;
    this.propriedades = propriedades;
    this.clock = clock;
  }

  @Override
  public TokenDeAcesso emitir(Usuario usuario) {
    Instant agora = clock.instant();
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(propriedades.issuer())
            .subject(usuario.getId().toString())
            .issuedAt(agora)
            .expiresAt(agora.plus(propriedades.expiracao()))
            .id(UUID.randomUUID().toString())
            .claim("perfil", usuario.getPerfil().name())
            .build();
    JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
    String valor = encoder.encode(JwtEncoderParameters.from(cabecalho, claims)).getTokenValue();
    return new TokenDeAcesso(valor, propriedades.expiracao().toSeconds());
  }
}
