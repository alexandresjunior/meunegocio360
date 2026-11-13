package br.com.meunegocio360.core.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Usuário que se autentica no Núcleo (RF-BE-001). Concentra as regras de ativação, bloqueio por
 * tentativas e registro de login (RN-01, RN-02, RN-04, RN-12). Não sobrescreve {@code toString()}
 * para nunca exibir o hash da senha.
 */
@Entity
@Table(name = "usuario")
public class Usuario {

  @Id private UUID id;

  @Column(nullable = false, length = 120)
  private String nome;

  @Column(nullable = false, length = 160, unique = true)
  private String email;

  @Column(name = "senha_hash", nullable = false, length = 100)
  private String senhaHash;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false, length = 20)
  private Perfil perfil;

  @Column(nullable = false)
  private boolean ativo;

  @Column(name = "tentativas_falhas", nullable = false)
  private int tentativasFalhas;

  @Column(name = "bloqueado_ate")
  private Instant bloqueadoAte;

  @Column(name = "ultimo_login_em")
  private Instant ultimoLoginEm;

  @Column(name = "criado_em", nullable = false, updatable = false)
  private Instant criadoEm;

  @Column(name = "atualizado_em", nullable = false)
  private Instant atualizadoEm;

  @Version
  @Column(nullable = false)
  private long versao;

  protected Usuario() {}

  public static Usuario novo(
      String nome, String email, String senhaHash, Perfil perfil, Instant agora) {
    Usuario usuario = new Usuario();
    usuario.id = UUID.randomUUID();
    usuario.nome = Objects.requireNonNull(nome);
    usuario.email = normalizarEmail(Objects.requireNonNull(email));
    usuario.senhaHash = Objects.requireNonNull(senhaHash);
    usuario.perfil = Objects.requireNonNull(perfil);
    usuario.ativo = true;
    usuario.criadoEm = agora;
    usuario.atualizadoEm = agora;
    return usuario;
  }

  /** RN-01: e-mail comparado sem diferenciar maiúsculas/minúsculas, armazenado em minúsculas. */
  public static String normalizarEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  public boolean estaBloqueado(Instant agora) {
    return bloqueadoAte != null && agora.isBefore(bloqueadoAte);
  }

  /** RN-02 e RN-13: só autentica ou renova sessão quem está ativo e não bloqueado. */
  public boolean podeAutenticar(Instant agora) {
    return ativo && !estaBloqueado(agora);
  }

  public long segundosRestantesDeBloqueio(Instant agora) {
    if (!estaBloqueado(agora)) {
      return 0;
    }
    long milissegundos = Duration.between(agora, bloqueadoAte).toMillis();
    return Math.max(1, (milissegundos + 999) / 1000);
  }

  /**
   * RN-04: registra uma falha de senha. Ao atingir o máximo de falhas consecutivas, bloqueia a
   * conta pelo período configurado.
   *
   * @return {@code true} se esta falha bloqueou a conta
   */
  public boolean registrarFalha(int maxTentativas, Duration bloqueio, Instant agora) {
    encerrarBloqueioVencido(agora);
    tentativasFalhas++;
    atualizadoEm = agora;
    if (tentativasFalhas >= maxTentativas) {
      bloqueadoAte = agora.plus(bloqueio);
      return true;
    }
    return false;
  }

  /** RN-04 e RN-12: login bem-sucedido zera o contador e registra o último login. */
  public void registrarLoginComSucesso(Instant agora) {
    tentativasFalhas = 0;
    bloqueadoAte = null;
    ultimoLoginEm = agora;
    atualizadoEm = agora;
  }

  private void encerrarBloqueioVencido(Instant agora) {
    if (bloqueadoAte != null && !agora.isBefore(bloqueadoAte)) {
      bloqueadoAte = null;
      tentativasFalhas = 0;
    }
  }

  public UUID getId() {
    return id;
  }

  public String getNome() {
    return nome;
  }

  public String getEmail() {
    return email;
  }

  public String getSenhaHash() {
    return senhaHash;
  }

  public Perfil getPerfil() {
    return perfil;
  }

  public boolean isAtivo() {
    return ativo;
  }

  public int getTentativasFalhas() {
    return tentativasFalhas;
  }

  public Instant getBloqueadoAte() {
    return bloqueadoAte;
  }

  public Instant getUltimoLoginEm() {
    return ultimoLoginEm;
  }
}
