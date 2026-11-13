package br.com.meunegocio360.core.auth.application;

import br.com.meunegocio360.core.auth.domain.RefreshTokenRepository;
import br.com.meunegocio360.core.auth.domain.Usuario;
import br.com.meunegocio360.core.auth.domain.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Caso de uso de login por e-mail e senha (RF-BE-001, RN-01 a RN-04, RN-11, RN-12). */
@Service
public class AutenticarUsuario {

  private static final Logger log = LoggerFactory.getLogger(AutenticarUsuario.class);
  private static final int LIMITE_BYTES_BCRYPT = 72;

  private final UsuarioRepository usuarios;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;
  private final EmissorDeSessao emissorDeSessao;
  private final AuthProperties propriedades;
  private final Clock clock;
  private final String hashFicticio;

  public AutenticarUsuario(
      UsuarioRepository usuarios,
      RefreshTokenRepository refreshTokens,
      PasswordEncoder passwordEncoder,
      EmissorDeSessao emissorDeSessao,
      AuthProperties propriedades,
      Clock clock) {
    this.usuarios = usuarios;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
    this.emissorDeSessao = emissorDeSessao;
    this.propriedades = propriedades;
    this.clock = clock;
    // Hash usado quando o e-mail não existe, para igualar o tempo de resposta (RN-03).
    this.hashFicticio = passwordEncoder.encode(UUID.randomUUID().toString());
  }

  /**
   * As falhas precisam ser gravadas mesmo com a exceção, por isso não há rollback para os erros de
   * credenciais e de bloqueio.
   */
  @Transactional(
      noRollbackFor = {
        CredenciaisInvalidasException.class,
        ContaTemporariamenteBloqueadaException.class
      })
  public SessaoAutenticada executar(String email, String senha) {
    Instant agora = clock.instant();
    String emailNormalizado = Usuario.normalizarEmail(email);
    Optional<Usuario> encontrado = usuarios.buscarPorEmailParaAtualizacao(emailNormalizado);

    if (encontrado.isEmpty()) {
      senhaConfere(senha, hashFicticio);
      log.info(
          "Falha de login: credenciais inválidas para {}",
          MascaraDeEmail.mascarar(emailNormalizado));
      throw new CredenciaisInvalidasException();
    }

    Usuario usuario = encontrado.get();
    if (usuario.estaBloqueado(agora)) {
      log.warn("Login recusado: conta bloqueada usuarioId={}", usuario.getId());
      throw new ContaTemporariamenteBloqueadaException(usuario.segundosRestantesDeBloqueio(agora));
    }

    boolean senhaCorreta = senhaConfere(senha, usuario.getSenhaHash());
    if (!usuario.isAtivo()) {
      log.info("Falha de login: usuário inativo usuarioId={}", usuario.getId());
      throw new CredenciaisInvalidasException();
    }
    if (!senhaCorreta) {
      registrarFalha(usuario, agora);
      throw new CredenciaisInvalidasException();
    }

    usuario.registrarLoginComSucesso(agora);
    log.info("Login com sucesso usuarioId={}", usuario.getId());
    return emissorDeSessao.novaSessao(usuario, agora);
  }

  private void registrarFalha(Usuario usuario, Instant agora) {
    boolean bloqueou =
        usuario.registrarFalha(propriedades.maxTentativas(), propriedades.bloqueio(), agora);
    if (bloqueou) {
      // RN-13: bloquear a conta revoga as sessões ativas.
      refreshTokens.revogarTodosDoUsuario(usuario.getId(), agora);
      log.warn(
          "Conta bloqueada por {} tentativas falhas usuarioId={}",
          usuario.getTentativasFalhas(),
          usuario.getId());
    } else {
      log.info(
          "Falha de login: senha incorreta usuarioId={} tentativas={}",
          usuario.getId(),
          usuario.getTentativasFalhas());
    }
  }

  /** O BCrypt não aceita mais de 72 bytes; senhas maiores são recusadas com o mesmo custo. */
  private boolean senhaConfere(String senha, String hash) {
    if (senha.getBytes(StandardCharsets.UTF_8).length > LIMITE_BYTES_BCRYPT) {
      passwordEncoder.matches(UUID.randomUUID().toString(), hashFicticio);
      return false;
    }
    return passwordEncoder.matches(senha, hash);
  }
}
