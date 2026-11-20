package br.com.meunegocio360.core.auth.infra;

import br.com.meunegocio360.core.auth.domain.Perfil;
import br.com.meunegocio360.core.auth.domain.Usuario;
import br.com.meunegocio360.core.auth.domain.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seed exclusivo do perfil dev (RNF-BE-24, RNF-102): um usuário fictício por perfil (RF-BE-002,
 * RN-08), com senhas lidas de SEED_ADMIN_SENHA, SEED_USUARIO_SENHA (OPERADOR_COMERCIAL) e
 * SEED_FINANCEIRO_SENHA. Usuários já existentes não são alterados e nenhuma empresa é criada, para
 * que o primeiro cadastro de empresa possa ser verificado.
 */
@Component
@Profile("dev")
class SeedDeDesenvolvimento implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(SeedDeDesenvolvimento.class);

  private final UsuarioRepository usuarios;
  private final PasswordEncoder passwordEncoder;
  private final Clock clock;
  private final String senhaAdmin;
  private final String senhaComercial;
  private final String senhaFinanceiro;

  SeedDeDesenvolvimento(
      UsuarioRepository usuarios,
      PasswordEncoder passwordEncoder,
      Clock clock,
      @Value("${app.seed.admin-senha:}") String senhaAdmin,
      @Value("${app.seed.usuario-senha:}") String senhaComercial,
      @Value("${app.seed.financeiro-senha:}") String senhaFinanceiro) {
    this.usuarios = usuarios;
    this.passwordEncoder = passwordEncoder;
    this.clock = clock;
    this.senhaAdmin = validar("SEED_ADMIN_SENHA", senhaAdmin);
    this.senhaComercial = validar("SEED_USUARIO_SENHA", senhaComercial);
    this.senhaFinanceiro = validar("SEED_FINANCEIRO_SENHA", senhaFinanceiro);
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    criarSeAusente("Administrador", "admin@meunegocio360.com.br", senhaAdmin, Perfil.ADMIN);
    // Mesmo e-mail do antigo usuário de seed USUARIO, migrado para OPERADOR_COMERCIAL pela V3.
    criarSeAusente(
        "Operador Comercial",
        "usuario@meunegocio360.com.br",
        senhaComercial,
        Perfil.OPERADOR_COMERCIAL);
    criarSeAusente(
        "Operador Financeiro",
        "financeiro@meunegocio360.com.br",
        senhaFinanceiro,
        Perfil.OPERADOR_FINANCEIRO);
  }

  private void criarSeAusente(String nome, String email, String senha, Perfil perfil) {
    if (usuarios.existsByEmail(email)) {
      return;
    }
    usuarios.save(
        Usuario.novo(nome, email, passwordEncoder.encode(senha), perfil, clock.instant()));
    log.info("Seed de desenvolvimento: usuário {} criado", perfil);
  }

  /**
   * Mesmos limites de senha do login (RN-11); sem isso o usuário de seed nunca conseguiria entrar.
   */
  private static String validar(String variavel, String senha) {
    if (senha == null
        || senha.length() < 8
        || senha.length() > 72
        || senha.getBytes(StandardCharsets.UTF_8).length > 72) {
      throw new IllegalStateException(
          variavel + " é obrigatória no perfil dev e deve ter entre 8 e 72 caracteres.");
    }
    return senha;
  }
}
